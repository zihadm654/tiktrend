import { auth } from "@tiktrend/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { loginHref } from "@/lib/catalog-params";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Admin · TikTrend",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect(loginHref("/admin"));
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Manage products, categories, orders, and reviews.
        </p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
