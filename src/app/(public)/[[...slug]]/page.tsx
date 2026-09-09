import { notFound } from "next/navigation";
import PublicApp from "@/public-site/App";

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

  return <PublicApp />;
}
