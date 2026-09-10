import { notFound } from "next/navigation";
import PublicApp from "@/public-site/App";
import { getPublicTicketCatalog } from "@/lib/catalog/public";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicRoutes = new Set([
  "about",
  "artists",
  "programme",
  "gallery",
  "tickets",
  "venue",
  "contact",
]);

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  if (slug && (slug.length !== 1 || !publicRoutes.has(slug[0]))) {
    notFound();
  }

  const catalog = await getPublicTicketCatalog();

  return <PublicApp catalog={catalog} />;
}
