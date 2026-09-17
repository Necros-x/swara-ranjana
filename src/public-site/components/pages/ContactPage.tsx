import React, { useState } from "react";
import { motion } from "motion/react";
import { SectionLabel } from "../common/SectionLabel";
import { EditorialHeading } from "../common/EditorialHeading";
import { ButterflyArtwork } from "../common/ButterflyArtwork";
import { ChevronDown, Clock3, MapPin, TicketCheck } from "lucide-react";

export const ContactPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "When do doors open and when does the show begin?",
      a: "Main hall doors are currently scheduled to open at 05:30 PM, with the performance scheduled to begin at 06:00 PM on Saturday, November 28, 2026.",
    },
    {
      q: "Can I choose an exact seat when reserving online?",
      a: "No. Choose a ticket category and quantity; the reservation system automatically allocates available physical seats within the auditorium blocks assigned to that category.",
    },
    {
      q: "How does pay on arrival work?",
      a: "Your reservation can be confirmed with payment still pending. Complete payment at the Swara Ranjana payment counter before going to the gate for admission.",
    },
    {
      q: "Can I leave the venue and return using the same ticket?",
      a: "Yes. After first admission, a gate scan can record an exit. Present the same valid QR code again when returning so the guest can be re-admitted.",
    },
  ];

  return (
    <div
      id="contact-page-root"
      className="relative overflow-hidden pb-24 pt-28 sm:pt-36"
    >
      <div className="pointer-events-none absolute -right-20 top-10 h-[650px] w-[450px] opacity-10">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <SectionLabel label="Event Information" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            LET&apos;S
            <br />
            <span className="font-normal italic text-[#2271B1]">CONNECT.</span>
          </EditorialHeading>

          <p className="text-base font-light leading-relaxed text-[#31465A] sm:text-lg">
            Confirmed public contact details for Swara Ranjana 2026 have not yet
            been published. This page will become the official point of contact
            for event, ticketing, media and accessibility inquiries once those
            channels are confirmed.
          </p>
        </div>

        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-5 lg:col-span-5">
            <div className="rounded-sm border border-ink-10 bg-[#F9FBFC] p-6">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
                01 / Venue
              </span>
              <MapPin className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-1 text-sm font-medium text-[#0E1721]">
                Mahinda Rajapaksha Auditorium
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Polgolla, Kandy, Sri Lanka
              </p>
            </div>

            <div className="rounded-sm border border-ink-10 bg-[#F9FBFC] p-6">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
                02 / Event Timing
              </span>
              <Clock3 className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-1 text-sm font-medium text-[#0E1721]">
                Saturday, November 28, 2026
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Doors 05:30 PM · Showtime 06:00 PM
              </p>
            </div>

            <div className="rounded-sm border border-ink-10 bg-[#F9FBFC] p-6">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
                03 / Ticket Support
              </span>
              <TicketCheck className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-1 text-sm font-medium text-[#0E1721]">
                Digital ticket assistance
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Ticket account, payment, cancellation and refund tools are
                available through the digital reservation flow. A confirmed
                support channel will be added here before public launch.
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-ink-10 bg-[#FEFFFF] p-8 shadow-sm sm:p-12 lg:col-span-7">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
              Official Contact Channel
            </span>
            <h3 className="mb-6 font-gemola text-3xl font-light text-[#0E1721] sm:text-4xl">
              Coming before public launch.
            </h3>

            <p className="max-w-xl text-sm font-light leading-relaxed text-[#31465A]">
              We are intentionally not displaying placeholder email addresses,
              phone numbers or social links. Once the official Swara Ranjana
              contact details are confirmed, this section can be connected to
              the real inquiry workflow.
            </p>

            <div className="mt-8 border-l-2 border-[#2271B1] bg-[#2271B1]/5 px-5 py-4 text-xs leading-relaxed text-[#31465A]">
              Until then, use the ticket and account pages for reservation,
              payment and ticket-management actions. Contact information shown
              here will only be published after verification.
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl border-t border-ink-10 py-16">
          <SectionLabel label="Common Inquiries" number="02" className="mb-4" />
          <EditorialHeading size="md" className="mb-10">
            Frequently Asked Questions
          </EditorialHeading>

          <div className="divide-y divide-ink-10 border-y border-ink-10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.q} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-5 text-left"
                  >
                    <span className="font-gemola text-xl font-light text-[#0E1721] transition-colors group-hover:text-[#2271B1] sm:text-2xl">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#7D8A95] transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#2271B1]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 max-w-2xl text-xs font-light leading-relaxed text-[#31465A] sm:text-sm"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
