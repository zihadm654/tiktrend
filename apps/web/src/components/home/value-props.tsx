import { BadgeCheckIcon, BanknoteIcon, TruckIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

const ICONS = [BanknoteIcon, TruckIcon, BadgeCheckIcon] as const;

export function ValueProps() {
  return (
    <section aria-label="Why shop with us" className="border-y bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        {siteConfig.valueProps.map((prop, index) => {
          const Icon = ICONS[index] ?? BadgeCheckIcon;
          return (
            <div className="flex flex-col gap-2" key={prop.title}>
              <Icon aria-hidden className="size-5 text-primary" />
              <h2 className="font-semibold text-sm tracking-tight">
                {prop.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {prop.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
