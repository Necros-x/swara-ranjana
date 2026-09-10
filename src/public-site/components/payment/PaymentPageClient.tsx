"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, HandCoins, Upload, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { confirmOnArrival, selectPaymentMethod, uploadPaymentSlip } from "@/app/actions/payment";
import type { GuestPaymentOrder, PaymentMethod } from "@/lib/payment/order";

export default function PaymentPageClient({order,accessToken}:{order:GuestPaymentOrder;accessToken:string}){
  const [method,setMethod]=useState<PaymentMethod>(order.paymentMethod??'CARD'); const [message,setMessage]=useState(''); const [pending,startTransition]=useTransition();
  const expired=order.status==='PENDING'&&!!order.expiresAt&&new Date(order.expiresAt).getTime()<=Date.now();
  const choose=(m:PaymentMethod)=>{setMethod(m);setMessage('');startTransition(async()=>{await selectPaymentMethod(order.orderNumber,accessToken,m);});};
  const onArrival=()=>startTransition(async()=>{const r=await confirmOnArrival(order.orderNumber,accessToken); if(r.ok) location.reload(); else setMessage(r.message||'Unable to continue.');});
  const submitSlip=(fd:FormData)=>startTransition(async()=>{fd.set('orderNumber',order.orderNumber);fd.set('accessToken',accessToken);const r=await uploadPaymentSlip(fd);if(r.ok) location.reload();else setMessage(r.message||'Unable to upload slip.');});
  return <main className="min-h-screen bg-[#FEFFFF] text-[#0E1721] py-12 px-4"><div className="max-w-5xl mx-auto">
    <Link href="/tickets" className="text-xs uppercase tracking-[.2em] text-[#7D8A95] hover:text-[#0E1721]">← Back to tickets</Link>
    <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-8"><section>
      <span className="text-[10px] font-mono tracking-[.3em] uppercase text-[#2271B1]">Secure Checkout</span><h1 className="font-gemola text-4xl sm:text-5xl mt-2">Choose payment.</h1>
      <p className="text-sm text-[#7D8A95] mt-3">Order {order.orderNumber}</p>
      {order.status==='CONFIRMED' ? <div className="mt-8 border border-emerald-200 bg-emerald-50 p-6 rounded-sm"><CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3"/><h2 className="font-medium">Reservation confirmed</h2><p className="text-sm text-[#54606B] mt-1">{order.paymentMethod==='ON_ARRIVAL'?'Pay at the entrance before admission.':'Your payment has been confirmed.'}</p><p className="text-xs text-[#7D8A95] mt-4">Tickets issued: {order.tickets.length}</p>{order.tickets.length>0&&<Link href={`/tickets/${order.orderNumber}?token=${encodeURIComponent(accessToken)}`} className="inline-flex mt-5 px-6 py-3 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[.18em] rounded-sm transition-colors">View digital tickets →</Link>}</div> : <>
      {expired&&<div className="mt-6 p-4 border border-amber-200 bg-amber-50 text-sm">This reservation hold has expired. Please create a new reservation.</div>}
      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        {([['CARD',CreditCard,'Card','Pay through a secure hosted card gateway.'],['ON_ARRIVAL',HandCoins,'On arrival','Reserve now and pay at the entrance.'],['BANK_SLIP',Upload,'Slip upload','Transfer to our bank and upload proof.']] as const).map(([id,Icon,title,desc])=><button key={id} onClick={()=>choose(id)} disabled={expired} className={`text-left p-5 border rounded-sm transition ${method===id?'border-[#2271B1] bg-[#2271B1]/5':'border-[#C2CBD2] hover:border-[#7D8A95]'}`}><Icon className="w-5 h-5 mb-4 text-[#2271B1]"/><div className="font-medium">{title}</div><p className="text-xs text-[#7D8A95] mt-2 leading-relaxed">{desc}</p></button>)}
      </div>
      <div className="mt-6 border border-[#C2CBD2] rounded-sm p-6">
        {method==='CARD'&&<><h2 className="font-medium">Card payment</h2><p className="text-sm text-[#7D8A95] mt-2">Card details will be entered on the payment provider's hosted page — never on this website.</p><button disabled className="mt-5 px-6 py-3 bg-[#0E1721]/50 text-white text-xs uppercase tracking-[.18em] rounded-sm">Card gateway connection pending</button></>}
        {method==='ON_ARRIVAL'&&<><h2 className="font-medium">Pay on arrival</h2><p className="text-sm text-[#7D8A95] mt-2">Your seats become confirmed now. Payment remains due at the entrance.</p><button disabled={pending||expired} onClick={onArrival} className="mt-5 px-6 py-3 bg-[#0E1721] text-white hover:bg-[#2271B1] text-xs uppercase tracking-[.18em] rounded-sm">Confirm pay on arrival</button></>}
        {method==='BANK_SLIP'&&<><h2 className="font-medium">Bank transfer slip</h2><p className="text-sm text-[#7D8A95] mt-2">Upload JPG, PNG, WebP or PDF up to 5 MB. Your hold is extended for review.</p>{order.slipStatus==='PENDING'?<div className="mt-5 flex gap-2 text-sm text-amber-700"><Clock3 className="w-4 h-4"/>Slip submitted — awaiting staff verification.</div>:<form action={submitSlip} className="mt-5 space-y-4"><input name="slip" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="block w-full text-sm"/><button disabled={pending||expired} className="px-6 py-3 bg-[#0E1721] text-white hover:bg-[#2271B1] text-xs uppercase tracking-[.18em] rounded-sm">Upload payment slip</button></form>}</>}
      </div>{message&&<p className="mt-4 text-sm text-red-600">{message}</p>}</>}
    </section><aside className="border border-[#C2CBD2] rounded-sm p-6 h-fit"><div className="flex items-center gap-2 text-xs text-[#7D8A95]"><ShieldCheck className="w-4 h-4 text-[#2271B1]"/>Protected reservation</div><h2 className="font-gemola text-2xl mt-5">{order.eventName}</h2><div className="mt-6 space-y-3">{order.items.map((i,idx)=><div key={idx} className="flex justify-between text-sm"><span>{i.name} × {i.quantity}</span><span>{order.currency} {i.totalPrice.toLocaleString('en-LK')}</span></div>)}</div><div className="mt-5 pt-5 border-t flex justify-between font-medium"><span>Total</span><span>{order.currency} {order.total.toLocaleString('en-LK')}</span></div>{order.expiresAt&&order.status==='PENDING'&&<p className="text-xs text-[#7D8A95] mt-4">Hold until {new Date(order.expiresAt).toLocaleString('en-LK')}</p>}</aside></div>
  </div></main>
}
