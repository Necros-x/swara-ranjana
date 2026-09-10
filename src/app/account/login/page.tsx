import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountLoginClient from "@/public-site/components/account/AccountLoginClient";
import { getCurrentCustomer } from "@/lib/auth/requireCustomer";

export const dynamic = "force-dynamic"; export const revalidate = 0;
export const metadata: Metadata = { title:"My Tickets — Swara Ranjana", robots:{index:false,follow:false,nocache:true} };

export default async function AccountLoginPage(){
  if(await getCurrentCustomer()) redirect("/account");
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F9FA] px-4 py-12 text-[#0E1721]">
    <img src="/butterfly/RTop.webp" alt="" aria-hidden="true" className="pointer-events-none absolute -right-28 -top-24 w-[520px] opacity-[.07]"/>
    <div className="relative z-10 w-full"><div className="mx-auto mb-6 flex max-w-md items-center justify-between"><Link href="/" className="font-gemola text-xl">SWARA RANJANA</Link><Link href="/tickets" className="text-[10px] uppercase tracking-[.18em] text-[#7D8A95] hover:text-[#2271B1]">Reserve tickets</Link></div><div className="flex justify-center"><AccountLoginClient/></div></div>
  </main>;
}
