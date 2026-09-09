import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Mail, Phone, MapPin, ChevronDown, Check, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiries',
    message: '',
  });
  const [isSent, setIsSent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the exact start time and entry policy?',
      a: 'The venue doors open for the welcome reception at 05:00 PM. Auditorium doors open at 05:30 PM, and the performance commences strictly at 06:00 PM. In accordance with classical concert etiquette, latecomers will be admitted only during the intermission.',
    },
    {
      q: 'Are children permitted at the performance?',
      a: 'To maintain the uninterrupted acoustic intimacy of the concert, the performance is recommended for audiences aged 10 and above. Every attendee must possess an allocated seat ticket.',
    },
    {
      q: 'Is photography or recording allowed during the show?',
      a: 'Professional cameras, flash photography, and continuous video recording are strictly prohibited inside the main auditorium. Guests are welcome to take commemorative photographs in the foyer and step-and-repeat areas before and after the performance.',
    },
    {
      q: 'What is the dress code for Swara Ranjana 2026?',
      a: 'The recommended dress code is Formal Evening Attire, Contemporary High-Fashion, or Traditional South Asian Formal (Sari, Sherwani, National Dress, Black Tie).',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      // Keep feedback visible
    }, 400);
  };

  return (
    <div id="contact-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-10 -right-20 w-[450px] h-[650px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Inquiries & Concierge" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            LET’S<br />
            <span className="italic font-normal text-[#2271B1]">CONNECT.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif">
            For press accreditation, VIP patron boxes, corporate sponsorship, or guest assistance, our concert secretariat is at your service.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CONTACT CHANNELS & EDITORIAL FORM GRID                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
          {/* Left Column: Direct Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 bg-[#F9FBFC] border border-ink-10 rounded-sm">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-2">
                01 / General Inquiries
              </span>
              <h4 className="font-medium text-[#0E1721] text-sm mb-1">
                Concert Secretariat
              </h4>
              <p className="text-xs text-[#7D8A95] font-light mb-3">
                Questions regarding event schedule, artist participation, and media.
              </p>
              <a
                href="mailto:contact@swararanjana.lk"
                className="text-xs font-mono text-[#0E1721] hover:text-[#2271B1] transition-colors"
              >
                contact@swararanjana.lk
              </a>
            </div>

            <div className="p-6 bg-[#F9FBFC] border border-ink-10 rounded-sm">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-2">
                02 / Box Office & VIP Concierge
              </span>
              <h4 className="font-medium text-[#0E1721] text-sm mb-1">
                Patron Hospitality
              </h4>
              <p className="text-xs text-[#7D8A95] font-light mb-3">
                Assistance with tier reservations, corporate bookings, and wheelchair access.
              </p>
              <div className="space-y-1 text-xs font-mono text-[#0E1721]">
                <p>concierge@swararanjana.lk</p>
                <p>+94 11 268 9000</p>
              </div>
            </div>

            <div className="p-6 bg-[#F9FBFC] border border-ink-10 rounded-sm">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-2">
                03 / Press & Media Desk
              </span>
              <h4 className="font-medium text-[#0E1721] text-sm mb-1">
                Editorial Press Passes
              </h4>
              <p className="text-xs text-[#7D8A95] font-light mb-3">
                High-resolution press kit assets, interview requests, and photography pits.
              </p>
              <a
                href="mailto:press@swararanjana.lk"
                className="text-xs font-mono text-[#0E1721] hover:text-[#2271B1] transition-colors"
              >
                press@swararanjana.lk
              </a>
            </div>
          </div>

          {/* Right Column: Clean Editorial Form */}
          <div className="lg:col-span-7 bg-[#FEFFFF] border border-ink-10 p-8 sm:p-12 rounded-sm shadow-sm">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-2">
              Send A Direct Message
            </span>
            <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light mb-6">
              Inquiry Form
            </h3>

            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Kanishka Fernando"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-2">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                    >
                      <option>General Inquiries</option>
                      <option>Ticket & Seat Concierge</option>
                      <option>VIP Box & Corporate Hospitality</option>
                      <option>Press & Media Accreditation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-2">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="How may we assist you with Swara Ranjana 2026?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-4 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.25em] font-medium transition-colors rounded-sm flex items-center gap-2"
                >
                  <span>Dispatch Message</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#2271B1]/10 text-[#2271B1] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-gemola text-3xl text-[#0E1721]">Message Received</h4>
                <p className="text-xs text-[#31465A] font-light max-w-sm mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Our concert concierge has received your inquiry and will respond within 24 hours.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="text-xs font-mono text-[#2271B1] underline pt-2"
                >
                  Send another inquiry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FAQ ACCORDION                                                            */}
        {/* ========================================================================= */}
        <div className="py-16 border-t border-ink-10 max-w-4xl mx-auto">
          <SectionLabel label="Common Inquiries" number="02" className="mb-4" />
          <EditorialHeading size="md" className="mb-10">
            Frequently Asked Questions
          </EditorialHeading>

          <div className="divide-y divide-ink-10 border-y border-ink-10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className="font-gemola text-xl sm:text-2xl text-[#0E1721] font-light group-hover:text-[#2271B1] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#7D8A95] transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#2271B1]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="text-xs sm:text-sm text-[#31465A] font-light leading-relaxed mt-4 max-w-2xl"
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
