import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicApp from "@/public-site/App";
import { getPublicTicketCatalog } from "@/lib/catalog/public";
import {
  PUBLIC_PAGE_METADATA,
  type PublicPageMetadataKey,
} from "@/public-site/data/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicRoutes = new Set<PublicPageMetadataKey>([
  "about",
  "artists",
  "vasr",
  "programme",
  "gallery",
  "tickets",
  "venue",
  "contact",
]);

function getPageKey(slug?: string[]): PublicPageMetadataKey {
  if (!slug?.length) return "home";
  return slug[0] as PublicPageMetadataKey;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pageKey = getPageKey(slug);
  const pageMetadata = PUBLIC_PAGE_METADATA[pageKey];

  if (!pageMetadata) return {};

  return {
    title: pageMetadata.absoluteTitle
      ? { absolute: pageMetadata.title }
      : pageMetadata.title,
    description: pageMetadata.description,
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  if (
    slug &&
    (slug.length !== 1 || !publicRoutes.has(slug[0] as PublicPageMetadataKey))
  ) {
    notFound();
  }

  const catalog = await getPublicTicketCatalog();

  return <PublicApp catalog={catalog} />;
}
