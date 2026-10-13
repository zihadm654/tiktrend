import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "@tiktrend/api/lib/shipping";

export const siteConfig = {
  brandName: "TikTrend Watches",
  contact: {
    address: "Level 4, House 12, Road 5, Banani",
    city: "Dhaka 1213, Bangladesh",
    email: "care@tiktrend.example",
    phone: "+880 1700-000000",
  },
  currency: {
    code: "BDT",
    symbol: "৳",
  },
  description:
    "TikTrend is a single-brand watch store in Bangladesh. Mechanical and smart timepieces, fixed fair pricing, and Cash on Delivery across the country.",
  hero: {
    ctaHref: "/watches",
    ctaLabel: "Shop watches",
    image: "https://picsum.photos/seed/watch-auto-1/1200/1200",
    secondaryLabel: "Explore collections",
    subtitle:
      "Every TikTrend watch is built to be the daily one — precise movements, honest prices, delivered to your door with Cash on Delivery.",
    title: "Time is the only thing you can't buy twice.",
  },
  name: "TikTrend",
  // Shipping is defined once in @tiktrend/api/lib/shipping so totals never drift.
  shipping: {
    fee: SHIPPING_FEE,
    freeThreshold: FREE_SHIPPING_THRESHOLD,
    note: `Free delivery on orders over ৳${(FREE_SHIPPING_THRESHOLD / 100).toLocaleString("en-US")}. Otherwise a flat ৳${SHIPPING_FEE / 100} fee.`,
  },
  socials: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },
  tagline: "Timepieces built to move with you.",
  valueProps: [
    {
      description: "Pay only when the watch is in your hands.",
      title: "Cash on Delivery",
    },
    {
      description: "Flat ৳60 shipping nationwide otherwise.",
      title: "Free delivery over ৳1,000",
    },
    {
      description: "Every movement is guaranteed.",
      title: "1–3 year warranty",
    },
  ],
} as const;
