import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-base tracking-tight">
            {siteConfig.brandName}
          </span>
          <p className="max-w-xs text-muted-foreground text-sm">
            {siteConfig.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm tracking-tight">Shop</h2>
          <nav aria-label="Shop" className="flex flex-col gap-2">
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/watches"
            >
              All Watches
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/wishlist"
            >
              Wishlist
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm tracking-tight">Help</h2>
          <nav aria-label="Help" className="flex flex-col gap-2">
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/about"
            >
              About us
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/contact"
            >
              Contact
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/shipping"
            >
              Shipping &amp; Returns
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm tracking-tight">Contact</h2>
          <address className="flex flex-col gap-2 text-muted-foreground text-sm not-italic">
            <a
              className="hover:text-foreground"
              href={`mailto:${siteConfig.contact.email}`}
            >
              {siteConfig.contact.email}
            </a>
            <a
              className="hover:text-foreground"
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
            >
              {siteConfig.contact.phone}
            </a>
            <span>
              {siteConfig.contact.address}
              <br />
              {siteConfig.contact.city}
            </span>
          </address>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm tracking-tight">Payments</h2>
          <p className="text-muted-foreground text-sm">
            We deliver with{" "}
            <span className="font-medium text-foreground">
              Cash on Delivery
            </span>{" "}
            nationwide. No prepayment needed.
          </p>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto w-full max-w-7xl px-4 py-4 text-muted-foreground text-xs sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {siteConfig.brandName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
