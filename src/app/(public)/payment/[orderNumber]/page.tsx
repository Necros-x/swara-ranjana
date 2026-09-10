import { notFound } from "next/navigation";
import PaymentPageClient from "@/public-site/components/payment/PaymentPageClient";
import { getGuestPaymentOrder } from "@/lib/payment/order";

export const metadata = { title: "Payment | Swara Ranjana 2026", robots: { index: false, follow: false } };
export default async function Page({params,searchParams}:{params:Promise<{orderNumber:string}>;searchParams:Promise<{token?:string}>}){
  const {orderNumber}=await params; const {token}=await searchParams; if(!token) notFound();
  const order=await getGuestPaymentOrder(orderNumber,token); if(!order) notFound();
  return <PaymentPageClient order={order} accessToken={token}/>;
}
