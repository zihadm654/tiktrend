import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  description: `Get in touch with ${siteConfig.brandName} about orders, shipping, or warranty.`,
  title: "Contact · TikTrend",
};

export default function ContactPage() {
  return (
    <PageShell
      description="We are a small team and we read every message. Reach us through any channel below."
      title="Contact us"
    >
      <section className="flex flex-col gap-3">
        <h2>Customer care</h2>
        <address className="not-italic">
          <ul>
            <li>
              Email:{" "}
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              Phone / WhatsApp:{" "}
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}>
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>Hours: Saturday–Thursday, 10:00–19:00 (BST)</li>
          </ul>
        </address>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Visit us</h2>
        <address className="not-italic">
          {siteConfig.contact.address}
          <br />
          {siteConfig.contact.city}
        </address>
      </section>

      <section className="flex flex-col gap-3">
        <h2>About your order</h2>
        <p>
          Have your order code ready (it looks like <strong>TT-XXXXXX</strong>).
          You can also check the status anytime from{" "}
          <a href="/orders">My Orders</a> after signing in.
        </p>
        <p>
          For delivery timelines and return rules, see{" "}
          <a href="/shipping">Shipping &amp; Returns</a>.
        </p>
      </section>
    </PageShell>
  );
}
