import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  description: `How ${siteConfig.brandName} collects, uses, and protects your personal information.`,
  title: "Privacy Policy · TikTrend",
};

export default function PrivacyPage() {
  return (
    <PageShell
      description="We collect the minimum we need to deliver your order — nothing more."
      title="Privacy Policy"
    >
      <section className="flex flex-col gap-3">
        <h2>What we collect</h2>
        <ul>
          <li>
            Account details: your name, email address, and a securely hashed
            password.
          </li>
          <li>
            Order details: the name, phone number, city, and address you give us
            at checkout, plus what you ordered.
          </li>
          <li>
            Basic technical logs needed to keep the site secure and working.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>How we use it</h2>
        <ul>
          <li>
            To process and deliver your Cash on Delivery order with our courier
            partners.
          </li>
          <li>
            To show you your order history and let you manage your account.
          </li>
          <li>To respond when you contact customer care.</li>
        </ul>
        <p>We never sell your personal information.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Payment data</h2>
        <p>
          Because we only offer <strong>Cash on Delivery</strong>, we never
          collect or store card or bank details.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Your choices</h2>
        <p>
          You can request a copy of your data or ask us to delete your account
          by emailing{" "}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
