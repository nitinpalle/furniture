/**
 * Prototype: parse 锦龙 furniture catalog → structured products JSON + extracted images.
 * Run: node scripts/import-jinglong.cjs
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const PDF_PATH = path.join(__dirname, "..", "锦龙家具餐台系列(2025)(1).pdf");
const OUT_DIR = path.join(__dirname, "..", "extracted", "jinglong");
const IMG_DIR_SCREEN = path.join(OUT_DIR, "page-screenshots");
const IMG_DIR_EMBED = path.join(OUT_DIR, "embedded-images");

fs.mkdirSync(IMG_DIR_SCREEN, { recursive: true });
fs.mkdirSync(IMG_DIR_EMBED, { recursive: true });

// Parse one page's text into product fields.
function parsePageText(text, pageNum) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const tableCode = /餐台[：:]\s*([0-9A-Za-z#]+)/.exec(cleaned)?.[1] ?? null;
  const chairCodes = [...cleaned.matchAll(/餐椅\s*[：:]\s*([0-9A-Za-z#]+)/g)].map(m => m[1]);
  const dimensions = /尺寸\s*[：:]\s*([0-9]+\s*[Xx×]\s*[0-9]+\s*[Xx×]\s*[0-9]+\s*cm)/.exec(cleaned)?.[1] ?? null;

  // Detect series headers (e.g. 极简实木餐台系列 / Black Walnut Round Table Series)
  const seriesZh = /([一-龥]{2,}系列)/.exec(cleaned)?.[1] ?? null;
  const seriesEn = /([A-Z][A-Za-z]+(?:\s+[A-Za-z]+){1,6}\s+Series)/.exec(cleaned)?.[1] ?? null;

  return {
    page: pageNum,
    tableCode,
    chairCodes,
    dimensions,
    seriesZh,
    seriesEn,
    rawText: cleaned.slice(0, 300),
    isProduct: Boolean(tableCode && dimensions),
  };
}

(async () => {
  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });

  const info = await parser.getInfo();
  console.log("PDF info:", JSON.stringify(info?.info ?? info, null, 2));

  // --- Pass 1: extract text per page ---
  const allText = await parser.getText();
  const totalPages = allText.total ?? allText.numpages ?? 52;
  console.log(`Total pages: ${totalPages}`);

  // Re-parse per page so we get per-page text (getText returns concatenated)
  const perPage = [];
  for (let p = 1; p <= totalPages; p++) {
    const r = await parser.getText({ first: p, last: p });
    perPage.push({ page: p, text: r.text });
  }

  const parsed = perPage.map(({ page, text }) => parsePageText(text, page));
  const products = parsed.filter(p => p.isProduct);
  console.log(`Parsed ${products.length} product pages out of ${totalPages}`);

  // --- Pass 2: extract embedded images for product pages only (sample first 3 to verify) ---
  const sampleProducts = products.slice(0, 3);
  console.log(`\nExtracting images from ${sampleProducts.length} sample product pages...`);

  for (const prod of sampleProducts) {
    // Method A: full-page screenshot
    try {
      const shot = await parser.getScreenshot({ first: prod.page, last: prod.page, scale: 1.5 });
      for (const pg of shot.pages ?? []) {
        const buf = Buffer.isBuffer(pg.data) ? pg.data : Buffer.from(pg.data);
        const file = path.join(IMG_DIR_SCREEN, `page-${prod.page}-shot.png`);
        fs.writeFileSync(file, buf);
        console.log(`  screenshot → ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1024).toFixed(0)} KB, ${pg.width}x${pg.height})`);
      }
    } catch (e) {
      console.warn(`  screenshot failed for page ${prod.page}: ${e.message}`);
    }

    // Method B: embedded raw images
    try {
      const emb = await parser.getImage({ first: prod.page, last: prod.page });
      for (const pg of emb.pages ?? []) {
        let i = 0;
        for (const img of pg.images ?? []) {
          const buf = Buffer.isBuffer(img.data) ? img.data : Buffer.from(img.data);
          const file = path.join(IMG_DIR_EMBED, `page-${prod.page}-img-${i++}-${img.name || "x"}.png`);
          fs.writeFileSync(file, buf);
          console.log(`  embedded  → ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1024).toFixed(0)} KB, ${img.width}x${img.height})`);
        }
      }
    } catch (e) {
      console.warn(`  embedded image failed for page ${prod.page}: ${e.message}`);
    }
  }

  // --- Output JSON manifest ---
  const manifest = {
    source: path.basename(PDF_PATH),
    totalPages,
    productCount: products.length,
    products: products.map(p => ({
      page: p.page,
      slug: p.tableCode ? `jinglong-${p.tableCode.replace(/#/g, "")}` : null,
      name: p.tableCode ? `Dining Table ${p.tableCode}` : null,
      tableCode: p.tableCode,
      chairCodes: p.chairCodes,
      dimensions: p.dimensions,
      series: p.seriesEn ?? p.seriesZh,
    })),
  };
  const manifestPath = path.join(OUT_DIR, "products.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written → ${path.relative(process.cwd(), manifestPath)}`);
  console.log("\nFirst 5 parsed products:");
  console.log(JSON.stringify(manifest.products.slice(0, 5), null, 2));

  if (parser.destroy) await parser.destroy();
})().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
