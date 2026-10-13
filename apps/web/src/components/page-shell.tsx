import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  description?: string;
  title: string;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b pb-6">
        <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-8 pt-8 text-muted-foreground text-sm/relaxed [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-semibold [&_h2]:text-base [&_h2]:text-foreground [&_h3]:font-medium [&_h3]:text-foreground [&_li]:leading-relaxed [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
