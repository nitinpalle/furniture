/**
 * 锦龙 (Jinglong) furniture catalog importer.
 *
 * Pipeline:
 *   1. Parse the PDF page-by-page → extract text + embedded image per page
 *   2. Regex-parse each page into a draft product (table code, dimensions, paired chair)
 *   3. Carry forward the most-recent series header so each product knows its series
 *   4. Resize image with sharp → upload to Supabase Storage `products` bucket
 *   5. Generate a 2-3 sentence description via Claude Haiku 4.5
 *   6. Upsert by slug into `products` (status='draft' so admin can review)
 *
 * Flags:
 *   --dry-run        Don't write to Supabase or call Anthropic. Prints what would happen.
 *   --limit N        Only process the first N products (default: all 47)
 *   --skip-ai        Insert products with description=null (no Anthropic call)
 *   --start N        Skip the first N product pages (resume after a crash)
 *
 * Run:
 *   node --env-file=.env.local scripts/import-jinglong.cjs --dry-run --limit 3
 *   node --env-file=.env.local scripts/import-jinglong.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { PDFParse } = require("pdf-parse");
const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");
const Anthropic = require("@anthropic-ai/sdk").default;

// =============================================================
// CONFIG
// =============================================================
const PDF_PATH = path.join(__dirname, "..", "锦龙家具餐台系列(2025)(1).pdf");
const SUPPLIER_NAME = "Jinglong Furniture";
const SUPPLIER_COUNTRY = "China";
const SUPPLIER_DEFAULT_LEAD_TIME = 60;
const SUPPLIER_DEFAULT_MOQ = 5;

// Hard-coded category lookups for this catalog (all dining tables)
const CATEGORY_SLUG = "dining";
const SUBCATEGORY_SLUG = "dining-tables";

// Anthropic
const ANTHROPIC_MODEL = "claude-haiku-4-5";

const args = process.argv.slice(2);
const FLAGS = {
  dryRun: args.includes("--dry-run"),
  skipAi: args.includes("--skip-ai"),
  limit: parseInt(args[args.indexOf("--limit") + 1], 10) || Infinity,
  start: parseInt(args[args.indexOf("--start") + 1], 10) || 0,
};

// =============================================================
// CLIENTS
// =============================================================
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnthropic() {
  if (FLAGS.skipAi) return null;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY in .env.local (or pass --skip-ai)",
    );
  }
  return new Anthropic({ apiKey: key });
}

// =============================================================
// PARSING
// =============================================================
function parsePageText(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const tableCode = /餐台[：:]\s*([0-9A-Za-z#]+)/.exec(cleaned)?.[1] ?? null;
  const chairCodes = [...cleaned.matchAll(/餐椅\s*[：:]\s*([0-9A-Za-z#]+)/g)].map(
    (m) => m[1],
  );
  const dimensions =
    /尺寸\s*[：:]\s*([0-9]+\s*[Xx×]\s*[0-9]+\s*[Xx×]\s*[0-9]+\s*cm)/i.exec(
      cleaned,
    )?.[1] ?? null;

  // Series headers — Chinese OR English, captured separately
  const seriesZh = /([一-龥]{2,}系列)/.exec(cleaned)?.[1] ?? null;
  const seriesEn =
    /([A-Z][A-Za-z]+(?:\s+[A-Za-z]+){1,6}\s+Series)/.exec(cleaned)?.[1] ?? null;

  return {
    tableCode,
    chairCodes,
    dimensions: formatDimensions(dimensions),
    seriesZh,
    seriesEn,
    isProduct: Boolean(tableCode && dimensions),
  };
}

// Normalize "150X150X76 cm" → "150 × 150 × 76 cm"
function formatDimensions(raw) {
  if (!raw) return null;
  const match = raw.match(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm/);
  if (!match) return raw;
  const [, w, d, h] = match;
  return `${w} × ${d} × ${h} cm`;
}

function buildSlug(code) {
  return `jinglong-${code.replace(/#/g, "").toLowerCase()}`;
}

function estimateCapacity(dimensions) {
  if (!dimensions) return null;
  const match = dimensions.match(/(\d+)\s*×\s*(\d+)/);
  if (!match) return null;
  const w = parseInt(match[1], 10);
  const d = parseInt(match[2], 10);
  if (Math.abs(w - d) <= 5) {
    // Round / square
    if (w >= 150) return "Seats 8";
    if (w >= 130) return "Seats 6";
    return "Seats 4";
  }
  // Rectangular
  if (w >= 280) return "Seats 8–10";
  if (w >= 220) return "Seats 6–8";
  if (w >= 180) return "Seats 4–6";
  return "Seats 4";
}

function buildName(code, dimensions) {
  // "Jinglong 6712" + " — 300×100×76 cm Dining Table"
  const sizeMatch = dimensions?.match(/(\d+)\s*×\s*(\d+)/);
  const widthCm = sizeMatch ? parseInt(sizeMatch[1], 10) : null;
  const depthCm = sizeMatch ? parseInt(sizeMatch[2], 10) : null;
  const isLong = widthCm && widthCm >= 220;
  const isRound = widthCm && depthCm && Math.abs(widthCm - depthCm) <= 5;
  const shape = isRound ? "Round" : isLong ? "Long" : "Rectangular";
  return `Jinglong ${code.replace(/#/g, "")} — ${shape} Dining Table`;
}

// =============================================================
// AI DESCRIPTION GENERATION
// =============================================================
async function generateDescription(anthropic, product) {
  const prompt = `Write a 2-3 sentence B2B furniture catalog description for this dining table.

Product code: ${product.tableCode}
Dimensions: ${product.dimensions}
Paired chair model: ${product.chairCodes?.[0] ?? "(varies)"}
Series: ${product.series ?? "Modern Solid Wood Dining Series"}
Country of origin: China

Rules:
- Tone: factual, professional, B2B trade catalog. No marketing fluff.
- Mention the dimensions naturally.
- Mention it pairs with the chair model.
- Do NOT invent features (no claims about "comfort", "luxury", specific materials, weight capacity, etc. unless stated above).
- Do NOT use exclamations or em-dashes.
- 2 to 3 sentences. Plain prose, no bullet lists.

Return ONLY the description text, no preamble.`;

  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 250,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("")
    .trim();

  return text;
}

// =============================================================
// IMAGE PROCESSING
// =============================================================
async function processAndUploadImage(supabase, rawBuffer, slug) {
  // Resize to 1600px max width, convert to WebP for ~70% size reduction
  const optimized = await sharp(rawBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const filePath = `${slug}/main.webp`;
  const { error } = await supabase.storage
    .from("products")
    .upload(filePath, optimized, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(filePath);

  return { url: publicUrl, sizeKb: Math.round(optimized.length / 1024) };
}

// =============================================================
// SUPPLIER UPSERT
// =============================================================
async function ensureSupplier(supabase) {
  // Check if supplier exists
  const { data: existing } = await supabase
    .from("suppliers")
    .select("id")
    .eq("name", SUPPLIER_NAME)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: SUPPLIER_NAME,
      country: SUPPLIER_COUNTRY,
      default_lead_time_days: SUPPLIER_DEFAULT_LEAD_TIME,
      default_moq: SUPPLIER_DEFAULT_MOQ,
      tags: ["dining", "premium", "china"],
      notes: "Imported automatically from 锦龙家具餐台系列(2025) catalog.",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Supplier create failed: ${error.message}`);
  return data.id;
}

// =============================================================
// CATEGORY/SUBCATEGORY LOOKUP
// =============================================================
async function getCategoryIds(supabase) {
  const { data: parent, error: e1 } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", CATEGORY_SLUG)
    .is("parent_id", null)
    .single();
  if (e1) throw new Error(`Category lookup failed: ${e1.message}`);

  const { data: sub, error: e2 } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", SUBCATEGORY_SLUG)
    .eq("parent_id", parent.id)
    .single();
  if (e2) throw new Error(`Subcategory lookup failed: ${e2.message}`);

  return { categoryId: parent.id, subcategoryId: sub.id };
}

// =============================================================
// MAIN
// =============================================================
async function main() {
  console.log("\n=== 锦龙 (Jinglong) Catalog Importer ===\n");
  console.log("Flags:", JSON.stringify(FLAGS, null, 2));
  console.log("");

  // ---- 1. Parse PDF ----
  console.log("[1/6] Parsing PDF…");
  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });
  const allText = await parser.getText();
  const totalPages = allText.total ?? 52;

  const perPage = [];
  for (let p = 1; p <= totalPages; p++) {
    const r = await parser.getText({ first: p, last: p });
    perPage.push({ page: p, text: r.text });
  }
  const parsed = perPage.map((x) => ({ page: x.page, ...parsePageText(x.text) }));

  // Carry forward series headers
  let lastSeries = null;
  for (const item of parsed) {
    if (item.seriesEn || item.seriesZh) {
      lastSeries = item.seriesEn ?? item.seriesZh;
    }
    item.series = lastSeries;
  }

  const products = parsed.filter((p) => p.isProduct).slice(FLAGS.start, FLAGS.start + FLAGS.limit);
  console.log(`    → Parsed ${products.length} product pages (of ${totalPages} total)\n`);

  if (FLAGS.dryRun) {
    console.log("[DRY RUN] First 3 parsed products:");
    console.log(JSON.stringify(products.slice(0, 3), null, 2));
    console.log("\n[DRY RUN] No images uploaded, no DB writes, no API calls.\n");
    if (parser.destroy) await parser.destroy();
    return;
  }

  // ---- 2. Init clients ----
  const supabase = getSupabase();
  const anthropic = getAnthropic();

  // ---- 3. Ensure supplier + categories ----
  console.log("[2/6] Resolving supplier + categories…");
  const supplierId = await ensureSupplier(supabase);
  const { categoryId, subcategoryId } = await getCategoryIds(supabase);
  console.log(`    → supplier_id: ${supplierId}`);
  console.log(`    → category_id: ${categoryId} (dining)`);
  console.log(`    → subcategory_id: ${subcategoryId} (dining-tables)\n`);

  // ---- 4. Process each product ----
  console.log("[3/6] Processing products…\n");
  const results = { created: 0, updated: 0, failed: 0 };

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = buildSlug(p.tableCode);
    const name = buildName(p.tableCode, p.dimensions);
    const prefix = `[${i + 1}/${products.length}]`;

    try {
      console.log(`${prefix} ${p.tableCode} → ${slug}`);

      // 4a. Extract embedded image for this page
      const emb = await parser.getImage({ first: p.page, last: p.page });
      const imageData = emb.pages?.[0]?.images?.[0]?.data;
      if (!imageData) {
        throw new Error(`No image found on page ${p.page}`);
      }
      const rawBuffer = Buffer.isBuffer(imageData)
        ? imageData
        : Buffer.from(imageData);

      // 4b. Resize + upload to Storage
      const { url: imageUrl, sizeKb } = await processAndUploadImage(
        supabase,
        rawBuffer,
        slug,
      );
      console.log(`         image: ${sizeKb} KB → ${imageUrl}`);

      // 4c. Generate description (or skip)
      let description = null;
      let descriptionSource = "manual";
      if (anthropic) {
        description = await generateDescription(anthropic, p);
        descriptionSource = "ai";
        console.log(`         desc: ${description.slice(0, 80)}…`);
      }

      // 4d. Upsert product (by slug)
      const productPayload = {
        slug,
        name,
        sku: p.tableCode,
        description,
        description_source: descriptionSource,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        supplier_id: supplierId,
        country_of_origin: "China",
        dimensions: p.dimensions,
        // material left null intentionally — we don't actually know it
        // from the catalog. Admin fills in after spot-checking the photo.
        material: null,
        capacity: estimateCapacity(p.dimensions),
        moq: SUPPLIER_DEFAULT_MOQ,
        lead_time_days: SUPPLIER_DEFAULT_LEAD_TIME,
        project_types: ["hospitality", "residential", "restaurant"],
        status: "draft",
        image_urls: [imageUrl],
      };

      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", existing.id);
        if (error) throw new Error(`Update failed: ${error.message}`);
        results.updated++;
      } else {
        const { error } = await supabase.from("products").insert(productPayload);
        if (error) throw new Error(`Insert failed: ${error.message}`);
        results.created++;
      }
    } catch (err) {
      console.error(`${prefix} ✗ ${slug}: ${err.message}`);
      results.failed++;
    }
  }

  // ---- 5. Cleanup ----
  if (parser.destroy) await parser.destroy();

  // ---- 6. Summary ----
  console.log("\n=== Summary ===");
  console.log(`  Created:  ${results.created}`);
  console.log(`  Updated:  ${results.updated}`);
  console.log(`  Failed:   ${results.failed}`);
  console.log(`  Total:    ${products.length}`);
  console.log("\nAll products inserted as status='draft'.");
  console.log(
    "To publish: UPDATE products SET status='published' WHERE supplier_id IN (SELECT id FROM suppliers WHERE name = 'Jinglong Furniture');",
  );
}

main().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(1);
});
