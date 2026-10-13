import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  description:
    "TikTrend is a single-brand watch store in Bangladesh, selling mechanical and smart timepieces with Cash on Delivery nationwide.",
  title: "About · TikTrend",
};

export default function AboutPage() {
  return (
    <PageShell
      description="One brand, a tight catalog, and a promise: honest prices and watches that keep up with your day."
      title="About TikTrend"
    >
      <section className="flex flex-col gap-3">
        <h2>Why we exist</h2>
        <p>
          Buying a watch online in Bangladesh usually means a maze of unbranded
          listings, unclear pricing, and no way to know what you will actually
          receive. TikTrend is the opposite. We are a single-brand store:
          everything on this site is ours, described precisely, and priced the
          same for everyone.
        </p>
        <p>
          We keep the catalog small on purpose. Each timepiece is chosen for a
          job — a dress watch, a daily beater, a dive watch, a smart companion —
          so you are not scrolling through hundreds of near-identical options.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>How we sell</h2>
        <p>
          Every order is <strong>Cash on Delivery</strong>. You pay the courier
          when the watch is in your hands, anywhere in Bangladesh. No card
          details, no prepayment, no risk of paying for something that never
          arrives.
        </p>
        <p>
          Shipping is a flat <strong>৳{siteConfig.shipping.fee / 100}</strong>{" "}
          nationwide and free on orders over ৳
          {(siteConfig.shipping.freeThreshold / 100).toLocaleString("en-US")}.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Our warranty</h2>
        <p>
          Every movement is covered for at least one year, and up to three years
          depending on the model. If something fails under normal use, we repair
          or replace it.
        </p>
        <p>
          Questions? <Link href="/contact">Contact us</Link> — we answer every
          message.
        </p>
      </section>
    </PageShell>
  );
}
