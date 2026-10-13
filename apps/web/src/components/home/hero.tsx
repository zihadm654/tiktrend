import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_55%)]"
      />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-6">
          <h1 className="max-w-xl text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            {siteConfig.hero.title}
          </h1>
          <p className="max-w-lg text-pretty text-base text-muted-foreground sm:text-lg">
            {siteConfig.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href={siteConfig.hero.ctaHref} />} size="lg">
              {siteConfig.hero.ctaLabel}
            </Button>
            <Button
              render={<a href="#categories" />}
              size="lg"
              variant="outline"
            >
              {siteConfig.hero.secondaryLabel}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-muted lg:max-w-lg">
          <Image
            alt="A TikTrend watch"
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 33vw, 100vw"
            src={siteConfig.hero.image}
          />
        </div>
      </div>
    </section>
  );
}
