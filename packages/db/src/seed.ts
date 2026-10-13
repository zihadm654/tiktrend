import { db } from "./index";
import { category, product } from "./schema/index";

interface CategorySeed {
  description: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface ProductSeed {
  attributes: Record<string, string>;
  categorySlug: string;
  compareAtPrice?: number;
  description: string;
  featured?: boolean;
  images: string[];
  name: string;
  price: number;
  sku: string;
  slug: string;
  stock: number;
}

const categories: CategorySeed[] = [
  {
    description: "Classic time-telling with quartz precision.",
    name: "Analog",
    slug: "analog",
    sortOrder: 1,
  },
  {
    description: "Stopwatch complications for the bold.",
    name: "Chronograph",
    slug: "chronograph",
    sortOrder: 2,
  },
  {
    description: "Self-winding mechanical movements.",
    name: "Automatic",
    slug: "automatic",
    sortOrder: 3,
  },
  {
    description: "Water-resistant builds for the deep.",
    name: "Diving",
    slug: "diving",
    sortOrder: 4,
  },
  {
    description: "Connected watches that track your day.",
    name: "Smart",
    slug: "smart",
    sortOrder: 5,
  },
  {
    description: "Fine materials and finishing by hand.",
    name: "Luxury",
    slug: "luxury",
    sortOrder: 6,
  },
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;

const products: ProductSeed[] = [
  // Analog
  {
    attributes: {
      caseDiameter: "38mm",
      caseMaterial: "Stainless steel",
      glass: "Mineral",
      movement: "Quartz",
      strapMaterial: "Leather",
      warranty: "1 year",
      waterResistance: "3 ATM",
    },
    categorySlug: "analog",
    description:
      "A timeless 38mm dial with a hand-stitched leather strap. Slim enough for every sleeve, sharp enough for every meeting.",
    featured: true,
    images: [
      img("watch-classic-1"),
      img("watch-classic-2"),
      img("watch-classic-3"),
    ],
    name: "Classic Analog 38",
    price: 850_000,
    sku: "TT-1001",
    slug: "classic-analog-38",
    stock: 12,
  },
  {
    attributes: {
      caseDiameter: "36mm",
      caseMaterial: "Stainless steel",
      glass: "Mineral",
      movement: "Quartz",
      strapMaterial: "Leather",
      warranty: "1 year",
      waterResistance: "3 ATM",
    },
    categorySlug: "analog",
    description:
      "Bare essentials: a 36mm face, two hands, no clutter. The daily watch that disappears on the wrist.",
    featured: true,
    images: [img("watch-minimal-1")],
    name: "Minimal Analog 36",
    price: 700_000,
    sku: "TT-1002",
    slug: "minimal-analog-36",
    stock: 0,
  },
  {
    attributes: {
      caseDiameter: "42mm",
      caseMaterial: "Stainless steel",
      glass: "Domed mineral",
      movement: "Quartz",
      strapMaterial: "Leather",
      warranty: "1 year",
      waterResistance: "5 ATM",
    },
    categorySlug: "analog",
    compareAtPrice: 1_800_000,
    description:
      "Inspired by mid-century dress watches, with domed glass and an applied-index dial.",
    images: [img("watch-heritage-1"), img("watch-heritage-2")],
    name: "Heritage Analog 42",
    price: 1_500_000,
    sku: "TT-1003",
    slug: "heritage-analog-42",
    stock: 8,
  },
  {
    attributes: {
      caseDiameter: "32mm",
      caseMaterial: "Stainless steel",
      glass: "Mineral",
      movement: "Quartz",
      strapMaterial: "Mesh steel",
      warranty: "1 year",
      waterResistance: "3 ATM",
    },
    categorySlug: "analog",
    description:
      "A featherweight 32mm case with mesh strap — the quietest statement you can make.",
    images: [img("watch-slim-1"), img("watch-slim-2")],
    name: "Slim Analog 32",
    price: 700_000,
    sku: "TT-1004",
    slug: "slim-analog-32",
    stock: 15,
  },
  // Chronograph
  {
    attributes: {
      caseDiameter: "44mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Quartz chronograph",
      strapMaterial: "Rubber",
      warranty: "2 years",
      waterResistance: "10 ATM",
    },
    categorySlug: "chronograph",
    compareAtPrice: 2_800_000,
    description:
      "A tachymeter bezel and triple sub-dials, built for timing laps — or just looking like you can.",
    featured: true,
    images: [img("watch-racer-1"), img("watch-racer-2"), img("watch-racer-3")],
    name: "Racer Chronograph 44",
    price: 2_400_000,
    sku: "TT-2001",
    slug: "racer-chronograph-44",
    stock: 6,
  },
  {
    attributes: {
      caseDiameter: "43mm",
      caseMaterial: "Brushed steel",
      glass: "Sapphire",
      movement: "Quartz chronograph",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "chronograph",
    description:
      "Aviation style with a knurled crown, matte dial, and legible Arabic numerals.",
    images: [img("watch-pilot-1"), img("watch-pilot-2")],
    name: "Pilot Chronograph 43",
    price: 2_200_000,
    sku: "TT-2002",
    slug: "pilot-chronograph-43",
    stock: 9,
  },
  {
    attributes: {
      caseDiameter: "40mm",
      caseMaterial: "Stainless steel",
      glass: "Mineral",
      movement: "Quartz chronograph",
      strapMaterial: "Leather",
      warranty: "1 year",
      waterResistance: "5 ATM",
    },
    categorySlug: "chronograph",
    description:
      "Two sub-dials, a tachymeter, and a case that works under a cuff.",
    images: [img("watch-classic-chrono-1"), img("watch-classic-chrono-2")],
    name: "Classic Chronograph 40",
    price: 1_900_000,
    sku: "TT-2003",
    slug: "classic-chronograph-40",
    stock: 11,
  },
  {
    attributes: {
      caseDiameter: "41mm",
      caseMaterial: "Stainless steel",
      glass: "Domed mineral",
      movement: "Quartz chronograph",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "chronograph",
    description:
      "A cream dial with pump pushers, echoing racing chronographs of the 1960s.",
    images: [img("watch-vintage-chrono-1"), img("watch-vintage-chrono-2")],
    name: "Vintage Chronograph 41",
    price: 2_600_000,
    sku: "TT-2004",
    slug: "vintage-chronograph-41",
    stock: 0,
  },
  // Automatic
  {
    attributes: {
      caseDiameter: "40mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Automatic, 21 jewels",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "automatic",
    description:
      "A 21-jewel self-winding movement you can see through the exhibition case back.",
    featured: true,
    images: [img("watch-auto-1"), img("watch-auto-2"), img("watch-auto-3")],
    name: "Heritage Automatic 40",
    price: 3_200_000,
    sku: "TT-3001",
    slug: "heritage-automatic-40",
    stock: 7,
  },
  {
    attributes: {
      caseDiameter: "39mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Automatic, open heart",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "3 ATM",
    },
    categorySlug: "automatic",
    description:
      "A cutaway dial reveals the balance wheel at work — horology as theatre.",
    images: [img("watch-open-heart-1"), img("watch-open-heart-2")],
    name: "Open Heart Automatic 39",
    price: 3_600_000,
    sku: "TT-3002",
    slug: "open-heart-automatic-39",
    stock: 5,
  },
  {
    attributes: {
      caseDiameter: "38mm",
      caseMaterial: "Polished steel",
      glass: "Sapphire",
      movement: "Automatic",
      strapMaterial: "Alligator-print leather",
      warranty: "2 years",
      waterResistance: "3 ATM",
    },
    categorySlug: "automatic",
    description:
      "Slim profile, guilloché dial, and a quiet presence under the cuff.",
    images: [img("watch-dress-1"), img("watch-dress-2")],
    name: "Dress Automatic 38",
    price: 2_800_000,
    sku: "TT-3003",
    slug: "dress-automatic-38",
    stock: 10,
  },
  {
    attributes: {
      caseDiameter: "42mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Automatic, 56h reserve",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "automatic",
    description:
      "A 56-hour power reserve with an arc indicator at ten o'clock.",
    images: [img("watch-power-1"), img("watch-power-2")],
    name: "Power Reserve Automatic 42",
    price: 4_100_000,
    sku: "TT-3004",
    slug: "power-reserve-automatic-42",
    stock: 4,
  },
  // Diving
  {
    attributes: {
      caseDiameter: "44mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Quartz",
      strapMaterial: "Steel bracelet",
      warranty: "2 years",
      waterResistance: "30 ATM",
    },
    categorySlug: "diving",
    description:
      "300m water resistance, screw-down crown, and a luminous bezel that starts at the dive line.",
    featured: true,
    images: [img("watch-deep-1"), img("watch-deep-2"), img("watch-deep-3")],
    name: "Deep Diver 300M",
    price: 2_700_000,
    sku: "TT-4001",
    slug: "deep-diver-300m",
    stock: 8,
  },
  {
    attributes: {
      caseDiameter: "43mm",
      caseMaterial: "Stainless steel",
      glass: "Mineral",
      movement: "Quartz",
      strapMaterial: "Rubber",
      warranty: "2 years",
      waterResistance: "20 ATM",
    },
    categorySlug: "diving",
    description:
      "A 200m tool watch that goes from the harbour to the office without changing strap.",
    images: [img("watch-tide-1"), img("watch-tide-2")],
    name: "Tide Diver 200M",
    price: 2_100_000,
    sku: "TT-4002",
    slug: "tide-diver-200m",
    stock: 13,
  },
  {
    attributes: {
      caseDiameter: "41mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Quartz",
      strapMaterial: "Steel bracelet",
      warranty: "2 years",
      waterResistance: "15 ATM",
    },
    categorySlug: "diving",
    compareAtPrice: 2_200_000,
    description:
      "Dive DNA in a 41mm everyday case, with a slim profile for wearing under a jacket.",
    images: [img("watch-urban-1")],
    name: "Urban Diver 41",
    price: 1_900_000,
    sku: "TT-4003",
    slug: "urban-diver-41",
    stock: 0,
  },
  {
    attributes: {
      caseDiameter: "42mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Quartz",
      strapMaterial: "Steel bracelet",
      warranty: "2 years",
      waterResistance: "20 ATM",
    },
    categorySlug: "diving",
    description:
      "A solid steel bracelet and unidirectional bezel, ready for salt water.",
    images: [img("watch-steel-1"), img("watch-steel-2")],
    name: "Steel Diver 42",
    price: 2_500_000,
    sku: "TT-4004",
    slug: "steel-diver-42",
    stock: 6,
  },
  // Smart
  {
    attributes: {
      batteryLife: "Up to 7 days",
      caseMaterial: "Aluminium",
      connectivity: "Bluetooth / GPS",
      movement: "Smart / AMOLED",
      strapMaterial: "Silicone",
      warranty: "1 year",
      waterResistance: "5 ATM",
    },
    categorySlug: "smart",
    description:
      "Heart rate, sleep, and GPS in a 46mm AMOLED case that lasts days.",
    featured: true,
    images: [img("watch-pulse-1"), img("watch-pulse-2"), img("watch-pulse-3")],
    name: "Pulse Smart 46",
    price: 3_800_000,
    sku: "TT-5001",
    slug: "pulse-smart-46",
    stock: 20,
  },
  {
    attributes: {
      batteryLife: "Up to 10 days",
      caseMaterial: "Aluminium",
      connectivity: "Bluetooth",
      movement: "Smart / LCD",
      strapMaterial: "Silicone",
      warranty: "1 year",
      waterResistance: "3 ATM",
    },
    categorySlug: "smart",
    description:
      "The essentials — notifications, steps, and sleep — in a light 40mm case.",
    images: [img("watch-lite-1"), img("watch-lite-2")],
    name: "Lite Smart 40",
    price: 1_600_000,
    sku: "TT-5002",
    slug: "lite-smart-40",
    stock: 25,
  },
  {
    attributes: {
      batteryLife: "Up to 5 days",
      caseMaterial: "Stainless steel",
      connectivity: "Bluetooth / GPS / NFC",
      movement: "Smart / AMOLED",
      strapMaterial: "Fluoroelastomer",
      warranty: "1 year",
      waterResistance: "5 ATM",
    },
    categorySlug: "smart",
    description:
      "Built-in maps, NFC payments, and training metrics for serious all-day wear.",
    images: [img("watch-pro-1"), img("watch-pro-2")],
    name: "Pro Smart 44",
    price: 4_500_000,
    sku: "TT-5003",
    slug: "pro-smart-44",
    stock: 14,
  },
  {
    attributes: {
      batteryLife: "Up to 8 days",
      caseMaterial: "Aluminium",
      connectivity: "Bluetooth",
      movement: "Smart / LCD",
      strapMaterial: "Silicone",
      warranty: "1 year",
      waterResistance: "3 ATM",
    },
    categorySlug: "smart",
    description:
      "Activity rings, guided breathing, and a featherweight strap for training days.",
    images: [img("watch-fit-1"), img("watch-fit-2")],
    name: "Fit Smart 38",
    price: 1_200_000,
    sku: "TT-5004",
    slug: "fit-smart-38",
    stock: 30,
  },
  // Luxury
  {
    attributes: {
      caseDiameter: "40mm",
      caseMaterial: "Gold-tone steel",
      glass: "Sapphire",
      movement: "Automatic",
      strapMaterial: "Leather",
      warranty: "3 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "luxury",
    description:
      "A gold-tone case with a champagne dial and hand-applied indices.",
    featured: true,
    images: [img("watch-royal-1"), img("watch-royal-2"), img("watch-royal-3")],
    name: "Royal Gold 40",
    price: 5_850_000,
    sku: "TT-6001",
    slug: "royal-gold-40",
    stock: 3,
  },
  {
    attributes: {
      caseDiameter: "42mm",
      caseMaterial: "Stainless steel",
      glass: "Sapphire",
      movement: "Automatic, moon phase",
      strapMaterial: "Leather",
      warranty: "2 years",
      waterResistance: "3 ATM",
    },
    categorySlug: "luxury",
    description:
      "A moon-phase aperture framed in a midnight-blue dial with gold markers.",
    images: [img("watch-moon-1"), img("watch-moon-2")],
    name: "Moonphase 42",
    price: 4_200_000,
    sku: "TT-6002",
    slug: "moonphase-42",
    stock: 5,
  },
  {
    attributes: {
      caseDiameter: "41mm",
      caseMaterial: "18k gold-tone",
      glass: "Sapphire",
      movement: "Manual tourbillon",
      strapMaterial: "Alligator leather",
      warranty: "3 years",
      waterResistance: "3 ATM",
    },
    categorySlug: "luxury",
    description:
      "A skeleton tourbillon at six o'clock — the movement itself is the dial.",
    images: [img("watch-tourbillon-1"), img("watch-tourbillon-2")],
    name: "Tourbillon 41",
    price: 9_800_000,
    sku: "TT-6003",
    slug: "tourbillon-41",
    stock: 2,
  },
  {
    attributes: {
      caseDiameter: "43mm",
      caseMaterial: "PVD-coated steel",
      glass: "Sapphire",
      movement: "Automatic, skeleton",
      strapMaterial: "Rubber",
      warranty: "2 years",
      waterResistance: "5 ATM",
    },
    categorySlug: "luxury",
    compareAtPrice: 4_000_000,
    description:
      "A gunmetal PVD case showing the gears at work, with lumed hands for the dark.",
    images: [img("watch-skeleton-1"), img("watch-skeleton-2")],
    name: "Skeleton PVD 43",
    price: 3_600_000,
    sku: "TT-6004",
    slug: "skeleton-pvd-43",
    stock: 7,
  },
];

async function main() {
  await db.transaction(async (tx) => {
    await tx.delete(product);
    await tx.delete(category);

    const insertedCategories = await tx
      .insert(category)
      .values(
        categories.map((c) => ({
          description: c.description,
          name: c.name,
          slug: c.slug,
          sortOrder: c.sortOrder,
        }))
      )
      .returning({ id: category.id, slug: category.slug });

    const categoryIds: Record<string, string> = {};
    for (const row of insertedCategories) {
      categoryIds[row.slug] = row.id;
    }

    await tx.insert(product).values(
      products.map((p) => {
        const categoryId = categoryIds[p.categorySlug];
        if (!categoryId) {
          throw new Error(`Unknown category slug "${p.categorySlug}"`);
        }
        return {
          attributes: p.attributes,
          categoryId,
          compareAtPrice: p.compareAtPrice,
          description: p.description,
          featured: p.featured ?? false,
          images: p.images,
          name: p.name,
          price: p.price,
          sku: p.sku,
          slug: p.slug,
          stock: p.stock,
        };
      })
    );
  });

  console.log(
    `Seeded ${categories.length} categories and ${products.length} products.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
