import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicApp from "@/public-site/App";
import { getPublicTicketCatalog } from "@/lib/catalog/public";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicRoutes = new Set([
  "about",
  "artists",
  "vasr",
  "programme",
  "gallery",
  "tickets",
  "venue",
  "contact",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug?.length === 1 && slug[0] === "vasr") {
    return {
      title: "VASR — Visual Artists Swara Ranjana",
      description:
        "Meet the developers, animation creators and visual artists shaping the visual language of Swara Ranjana 2026.",
    };
  }

  return {};
}

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
