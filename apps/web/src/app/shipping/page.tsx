import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  description:
    "Cash on Delivery across Bangladesh. Flat ৳60 shipping, free over ৳1,000. Learn about delivery timelines, cancellations, and warranty.",
  title: "Shipping & Returns · TikTrend",
};

export default function ShippingPage() {
  const fee = siteConfig.shipping.fee / 100;
  const threshold = (siteConfig.shipping.freeThreshold / 100).toLocaleString(
    "en-US"
  );

  return (
    <PageShell
      description="How Cash on Delivery works, when your watch arrives, and what happens if something is not right."
      title="Shipping & Returns"
    >
      <section className="flex flex-col gap-3">
        <h2>Delivery</h2>
        <ul>
          <li>
            Flat shipping of <strong>৳{fee}</strong> nationwide, free on orders
            over <strong>৳{threshold}</strong>.
          </li>
          <li>Orders inside Dhaka usually arrive within 1–2 business days.</li>
          <li>Elsewhere in Bangladesh, expect 2–5 business days.</li>
          <li>You pay the courier in cash when the watch is handed to you.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Order status</h2>
        <p>
          Every order moves through a short, honest lifecycle:{" "}
          <strong>Pending</strong> when placed, <strong>Confirmed</strong> once
          we verify it, <strong>Shipped</strong> when it leaves our hands, and{" "}
          <strong>Delivered</strong> when you receive it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Cancellations</h2>
        <p>
          Changed your mind? You can cancel from{" "}
          <Link href="/orders">My Orders</Link> while the order is still{" "}
          <strong>Pending</strong>. Once we have confirmed and packed it,
          contact us and we will do our best to help.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Returns &amp; warranty</h2>
        <ul>
          <li>
            If a watch arrives damaged or is not as described, contact us within
            7 days of delivery for a replacement or refund.
          </li>
          <li>
            Every movement carries a 1–3 year warranty depending on the model.
          </li>
          <li>
            Warranty covers manufacturing defects, not accidental damage or
            water ingress.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Still need help?</h2>
        <p>
          Reach us at{" "}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          or{" "}
          <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}>
            {siteConfig.contact.phone}
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
