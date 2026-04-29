/**
 * Seed mock data for 4 representative products so we can preview the PDP
 * with realistic content (full description, material, color, multiple
 * images). Idempotent — re-running just overwrites the same rows.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed-mock-data.cjs
 */
const { createClient } = require("@supabase/supabase-js");

function unsplash(id, w = 1600) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;
}

const MOCKS = [
  {
    slug: "jinglong-6712",
    update: {
      description:
        "A 300 × 100 × 76 cm long dining table with a sintered marble top and a sculpted solid walnut base. Designed for hospitality lobbies and large residential dining rooms where the table sets the centrepiece. Pairs with chair model 6884# in matching walnut.",
      description_source: "manual",
      material: "Sintered marble top + solid walnut base",
      color: "Black walnut + white marble",
      extraImages: [
        unsplash("1505691938895-1758d7feb511"),
        unsplash("1582719478250-c89cae4dc85b"),
      ],
    },
  },
  {
    slug: "jinglong-6606",
    update: {
      description:
        "A 150 × 150 × 76 cm round dining table on a solid walnut pedestal. Seats up to eight comfortably and works particularly well in suite dining rooms or hotel conference settings. Pairs with chair model 6855# in matching walnut.",
      description_source: "manual",
      material: "Solid walnut top + walnut pedestal base",
      color: "Walnut natural",
      extraImages: [
        unsplash("1586023492125-27b2c045efd7"),
        unsplash("1517248135467-4c7edcad34c4"),
      ],
    },
  },
  {
    slug: "jinglong-6601",
    update: {
      description:
        "A 160 × 100 × 76 cm rectangular dining table with a sintered stone top and a slim solid wood frame. Suited to smaller residential dining rooms or restaurant booths where a compact footprint matters. Pairs with chair model 6877#.",
      description_source: "manual",
      material: "Sintered stone top + solid wood frame",
      color: "Walnut + black sintered top",
      extraImages: [unsplash("1497366216548-37526070297c")],
    },
  },
  {
    slug: "jinglong-6720",
    update: {
      description:
        "A 240 × 110 × 76 cm dining table with a sculpted walnut base and a polished sintered top. Seats eight, suited to hotel restaurant or high-end residential settings where a statement base matters. Pairs with chair model 6888#.",
      description_source: "manual",
      material: "Sintered stone top + sculpted walnut base",
      color: "Walnut + grey sintered top",
      extraImages: [
        unsplash("1505691938895-1758d7feb511"),
        unsplash("1517248135467-4c7edcad34c4"),
        unsplash("1582719478250-c89cae4dc85b"),
      ],
    },
  },
];

(async () => {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  console.log("\n=== Seeding mock data ===\n");

  for (const mock of MOCKS) {
    const { data: existing, error: fetchErr } = await sb
      .from("products")
      .select("slug,name,image_urls")
      .eq("slug", mock.slug)
      .maybeSingle();

    if (fetchErr || !existing) {
      console.error(`✗ ${mock.slug}: not found in DB — ${fetchErr?.message ?? "no row"}`);
      continue;
    }

    const originalImage = existing.image_urls?.[0];
    if (!originalImage) {
      console.error(`✗ ${mock.slug}: no original image to keep`);
      continue;
    }

    const newImages = [originalImage, ...mock.update.extraImages];

    const { error: updateErr } = await sb
      .from("products")
      .update({
        description: mock.update.description,
        description_source: mock.update.description_source,
        material: mock.update.material,
        color: mock.update.color,
        image_urls: newImages,
      })
      .eq("slug", mock.slug);

    if (updateErr) {
      console.error(`✗ ${mock.slug}: update failed — ${updateErr.message}`);
      continue;
    }
    console.log(
      `✓ ${mock.slug.padEnd(20)} ${newImages.length} images · ${mock.update.material}`,
    );
  }

  console.log("\nDone. Refresh the PDP for any of these slugs to preview.\n");
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
