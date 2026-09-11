"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PageId, Artist, GalleryItem } from "./types";
import { GALLERY_ITEMS } from "./data/concertData";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { MobileMenu } from "./components/common/MobileMenu";
import { PublicPageLoader } from "./components/common/PublicPageLoader";
import { ArtistModal } from "./components/common/ArtistModal";
import { TicketReservationModal } from "./components/common/TicketReservationModal";
import { LightboxModal } from "./components/common/LightboxModal";
import { ScrollProgress } from "./components/common/ScrollProgress";
import type { PublicTicketCatalog } from "@/lib/catalog/types";

// Pages
import { HomePage } from "./components/pages/HomePage";
import { AboutPage } from "./components/pages/AboutPage";
import { ArtistsPage } from "./components/pages/ArtistsPage";
import { ProgrammePage } from "./components/pages/ProgrammePage";
import { GalleryPage } from "./components/pages/GalleryPage";
import { TicketsPage } from "./components/pages/TicketsPage";
import { VenuePage } from "./components/pages/VenuePage";
import { ContactPage } from "./components/pages/ContactPage";

const PUBLIC_INTRO_DURATION = 1150;

// Keep the branded intro to the first public render in the current browser
// document. Client-side navigation should not keep replaying it.
let hasLoadedPublicExperience = false;

export default function App({
  catalog = null,
}: {
  catalog?: PublicTicketCatalog | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showExperienceLoader, setShowExperienceLoader] = useState(
    () => !hasLoadedPublicExperience,
  );

  const activePage: PageId = (() => {
    const segment = pathname.split("/").filter(Boolean)[0] as
      | PageId
      | undefined;
    const valid: PageId[] = [
      "home",
      "about",
      "artists",
      "programme",
      "gallery",
      "tickets",
      "venue",
      "contact",
    ];
    return segment && valid.includes(segment) ? segment : "home";
  })();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState<boolean>(false);

  // Modals state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] =
    useState<boolean>(false);
  const [ticketTierId, setTicketTierId] = useState<string | undefined>(
    undefined,
  );
  const [lightboxItem, setLightboxItem] =
    useState<GalleryItem | null>(null);

  const handleNavigate = (page: PageId) => {
    router.push(page === "home" ? "/" : `/${page}`);
  };

  const handleOpenTicketsModal = (tierId?: string) => {
    setTicketTierId(tierId);
    setIsTicketsModalOpen(true);
  };

  const handleOpenGalleryItem = (id: string) => {
    const item = GALLERY_ITEMS.find((galleryItem) => galleryItem.id === id);
    if (item) setLightboxItem(item);
  };

  // The branded loader is visual only; it disappears automatically with no
  // extra enter button or user action required.
  useEffect(() => {
    if (!showExperienceLoader) return;

    const timer = window.setTimeout(() => {
      hasLoadedPublicExperience = true;
      setShowExperienceLoader(false);
    }, PUBLIC_INTRO_DURATION);

    return () => window.clearTimeout(timer);
  }, [showExperienceLoader]);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return (
    <div className="min-h-screen bg-[#FEFFFF] text-[#0E1721] flex flex-col justify-between selection:bg-[#2271B1] selection:text-white antialiased">
      <AnimatePresence>
        {showExperienceLoader && <PublicPageLoader />}
      </AnimatePresence>

      <ScrollProgress />

      {/* Top Fixed Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenTicketsModal={() => handleOpenTicketsModal()}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Page Content with motion transition */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {activePage === "home" && (
              <HomePage
                onNavigate={handleNavigate}
                onOpenArtistModal={setSelectedArtist}
                onOpenTicketsModal={handleOpenTicketsModal}
                onOpenGalleryItem={handleOpenGalleryItem}
              />
            )}
            {activePage === "about" && (
              <AboutPage
                onNavigate={handleNavigate}
                onOpenTicketsModal={() => handleOpenTicketsModal()}
              />
            )}
            {activePage === "artists" && (
              <ArtistsPage
                onOpenArtistModal={setSelectedArtist}
                onOpenTicketsModal={() => handleOpenTicketsModal()}
              />
            )}
            {activePage === "programme" && (
              <ProgrammePage
                onOpenTicketsModal={() => handleOpenTicketsModal()}
              />
            )}
            {activePage === "gallery" && (
              <GalleryPage onOpenLightbox={setLightboxItem} />
            )}
            {activePage === "tickets" && (
              <TicketsPage
                onOpenTicketsModal={handleOpenTicketsModal}
                ticketTiers={catalog?.ticketTiers}
                concertMeta={catalog?.concertMeta}
              />
            )}
            {activePage === "venue" && (
              <VenuePage
                onOpenTicketsModal={() => handleOpenTicketsModal()}
              />
            )}
            {activePage === "contact" && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Editorial Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenTicketsModal={() => handleOpenTicketsModal()}
      />

      {/* Fullscreen Mobile Navigation Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        activePage={activePage}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigate}
        onOpenTicketsModal={() => handleOpenTicketsModal()}
      />

      {/* Artist Details Modal */}
      <ArtistModal
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
        onReserveClick={() => handleOpenTicketsModal()}
      />

      {/* Ticket Reservation Drawer Modal */}
      <TicketReservationModal
        isOpen={isTicketsModalOpen}
        initialTierId={ticketTierId}
        ticketTiers={catalog?.ticketTiers}
        concertMeta={catalog?.concertMeta}
        onClose={() => setIsTicketsModalOpen(false)}
      />

      {/* Gallery Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        items={GALLERY_ITEMS}
        onClose={() => setLightboxItem(null)}
        onSelect={setLightboxItem}
      />
    </div>
  );
}
