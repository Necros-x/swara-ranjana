import { notFound } from "next/navigation";
import RemotePaymentScanner from "@/admin-site/pages/RemotePaymentScanner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  if (!SESSION_PATTERN.test(sessionId)) notFound();

  return <RemotePaymentScanner sessionId={sessionId} />;
}
