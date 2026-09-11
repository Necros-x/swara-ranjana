import { Artist, GalleryItem, PreviousEdition, ProgrammeAct, TicketTier } from '../types';

export const CONCERT_META = {
  name: 'SWARA RANJANA',
  year: '2026',
  fullTitle: 'Swara Ranjana 2026 — Live Musical Experience',
  tagline: 'An evening where voices, melodies and memories become one.',
  date: 'Saturday, November 28, 2026',
  dateShort: '28.11.2026',
  time: '06:00 PM – 11:00 PM',
  doorsOpen: '05:30 PM',
  venue: 'Mahinda Rajapaksha Auditorium, Polgolla',
  hall: 'NICD Mahinda Rajapaksha Auditorium',
  city: 'Polgolla, Kandy, Sri Lanka',
  organizer: "St. Sylvester's College, Kandy",
  dressCode: 'Black Tie / Formal Eveningwear / Modern Sri Lankan Elegance',
  expectedAudience: '1,120 Guests',
  ticketCurrency: 'LKR',
};

export const ARTISTS_DATA: Artist[] = [
  {
    id: 'kavinda-seneviratne',
    number: '01',
    name: 'Kavinda Seneviratne',
    role: 'Lead Vocalist & Sitar Maestro',
    category: 'Strings & Sitar',
    shortDescription: 'Master of North Indian classical ragas intertwined with evocative Sinhala lyrical phrasing.',
    bio: 'Internationally acclaimed sitarist and vocalist with two decades of training at the Gandharva Mahavidyalaya. Kavinda’s performances are celebrated for their transcendent microtonal nuances, meditative alaap progressions, and fiery jugalbandis that bridge ancient Vedic musical roots with modern symphonic grandeur.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85',
    socials: {
      instagram: 'https://instagram.com',
      spotify: 'https://spotify.com',
      youtube: 'https://youtube.com',
    },
    featuredHighlights: [
      'Presidential Honors for Musical Innovation (2024)',
      'Featured at South Asian Symphony Orchestra (Geneva)',
      'Composer of the ethereal raga suite "Mayura"',
    ],
    repertoirePreview: 'Raga Yaman in 16-beat Teentaal transitioning into "Sandawatha"',
  },
  {
    id: 'nayanthara-rajapaksha',
    number: '02',
    name: 'Nayanthara Rajapaksha',
    role: 'Carnatic & Contemporary Vocalist',
    category: 'Vocals',
    shortDescription: 'A soaring soprano whose voice moves effortlessly from delicate whisper to raw harmonic resonance.',
    bio: 'Recognized as one of the most distinctive contemporary voices in South Asia, Nayanthara brings deep classical rigor coupled with modern jazz phrasing and poetic emotional vulnerability. Her performance in Swara Ranjana 2026 marks her debut orchestral collaboration in Sri Lanka.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=85',
    socials: {
      instagram: 'https://instagram.com',
      spotify: 'https://spotify.com',
    },
    featuredHighlights: [
      'Over 40 million global streaming listens',
      'Graduate of Berklee College of Music & Kalakshetra',
      'Soloist with the Chamber Strings of Vienna',
    ],
    repertoirePreview: 'Carnatic thillana adapted for 24-piece acoustic string ensemble',
  },
  {
    id: 'ravindu-de-silva',
    number: '03',
    name: 'Ravindu De Silva',
    role: 'Master Percussionist & Geta Bera Virtuoso',
    category: 'Percussion & Tabla',
    shortDescription: 'Pioneering organic percussionist merging indigenous ritual rhythms with global polyrhythmic textures.',
    bio: 'Born into a seventh-generation lineage of traditional Ruhunu percussionists, Ravindu transforms ancient Sri Lankan rhythmic syllables into an electrifying, hypnotic stage experience. His acoustic setup features custom-crafted low-resonance clay bera, Indian tabla, and subtle vibraphones.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
    },
    featuredHighlights: [
      'Master of Traditional Kandyan & Low Country Percussion',
      'Key collaborator on film scores for Venice Film Festival',
      'Inventor of the resonant bamboo-clay dual drum',
    ],
    repertoirePreview: 'Solo percussion dialogue "Sathara Waram" with ambient cello drone',
  },
  {
    id: 'amali-perera',
    number: '04',
    name: 'Dr. Amali Perera',
    role: 'Principal Cellist & Orchestral Conductor',
    category: 'Strings & Sitar',
    shortDescription: 'Director of the Chamber String Ensemble, weaving rich European textures with oriental modes.',
    bio: 'Dr. Amali Perera has conducted prestigious ensembles across London, Tokyo, and Singapore. As musical director for the orchestral movements of Swara Ranjana 2026, she creates shimmering, cinematic tapestries that cushion every melodic solo.',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1400&q=85',
    socials: {
      spotify: 'https://spotify.com',
      instagram: 'https://instagram.com',
    },
    featuredHighlights: [
      'Royal College of Music, London Alumna',
      'Principal Guest Conductor, Asian Youth Orchestra',
      'Pioneer of South Asian cross-genre string scoring',
    ],
    repertoirePreview: 'Overture in D Minor: "The Awakening Butterfly"',
  },
  {
    id: 'dinuk-wijesinghe',
    number: '05',
    name: 'Dinuk Wijesinghe',
    role: 'Bansuri & Bamboo Flute Master',
    category: 'Keyboards & Flute',
    shortDescription: 'Breath transformed into pure emotion; delicate microtones floating across ambient acoustic spaces.',
    bio: 'Dinuk’s bansuri playing is revered for its quiet intimacy and meditative stillness. His breath control and profound raga exposition transport listeners into timeless dreamscapes of dusk and morning dew.',
    image: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?auto=format&fit=crop&w=1400&q=85',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
    },
    featuredHighlights: [
      'Over 25 years of master disciple parampara training',
      'Soloist at the UNESCO Peace Concert Series (Paris)',
      'Acoustic sound healer and master flute craftsman',
    ],
    repertoirePreview: 'Bansuri improvisation over Raga Charukeshi with minimalist piano chords',
  },
  {
    id: 'isuru-bandara',
    number: '06',
    name: 'Isuru Bandara',
    role: 'Sound Architect & Modular Synthesist',
    category: 'Contemporary Fusion',
    shortDescription: 'Infusing live acoustic instrumentation with sublime spatial tape echoes and sub-bass warmth.',
    bio: 'Crafting the invisible atmosphere that unifies Swara Ranjana, Isuru sculpts analog warmth, reverberant hall dynamics, and subtle spatial panning that surrounds the audience in pure sonic intimacy.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
    portraitLarge: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85',
    socials: {
      spotify: 'https://spotify.com',
      instagram: 'https://instagram.com',
    },
    featuredHighlights: [
      'Sound design for award-winning contemporary dance productions',
      'Analog modular synthesis specialist',
      'Spatial audio consultant for immersive live performance',
    ],
    repertoirePreview: 'Live modular interlude weaving field recordings and sustained harmonic textures',
  },
];

export const PROGRAMME_ACTS: ProgrammeAct[] = [
  {
    id: 'act-01', time: '06:00 PM', duration: '25 min', title: 'The Awakening Butterfly', subtitle: 'Orchestral Overture', performer: 'Full Chamber Ensemble', categoryTag: 'Overture', description: 'A cinematic opening movement introducing the evening’s melodic motifs through strings, flute, percussion and voice.',
  },
  {
    id: 'act-02', time: '06:30 PM', duration: '35 min', title: 'Raga at Dusk', performer: 'Kavinda Seneviratne & Ensemble', categoryTag: 'Classical', description: 'An unfolding North Indian raga journey moving from meditative alaap to rhythmic ensemble dialogue.',
  },
  {
    id: 'act-03', time: '07:10 PM', duration: '30 min', title: 'Voice of the Lotus', performer: 'Nayanthara Rajapaksha', categoryTag: 'Vocals', description: 'Carnatic precision and contemporary vocal expression framed by a chamber string arrangement.',
  },
  {
    id: 'intermission', time: '07:40 PM', duration: '25 min', title: 'Intermission', performer: 'Foyer Reception', isIntermission: true, description: 'A short interval before the second movement of the evening.',
  },
  {
    id: 'act-04', time: '08:05 PM', duration: '35 min', title: 'Sathara Waram', performer: 'Ravindu De Silva', categoryTag: 'Percussion', description: 'A polyrhythmic dialogue rooted in Sri Lankan percussion traditions and contemporary orchestral texture.',
  },
  {
    id: 'act-05', time: '08:45 PM', duration: '30 min', title: 'Breath & Moonlight', performer: 'Dinuk Wijesinghe', categoryTag: 'Flute', description: 'Bansuri, cello and piano unfold across a quiet, meditative sonic landscape.',
  },
  {
    id: 'act-06', time: '09:20 PM', duration: '50 min', title: 'Metamorphosis', performer: 'All Featured Artists', categoryTag: 'Finale', description: 'The evening converges in a full ensemble finale, returning to the butterfly motif in its most expansive form.',
  },
];

export const TICKET_TIERS: TicketTier[] = [
  { id: 'tier-general', code: 'GENERAL', tierName: 'General', subtitle: 'Panoramic auditorium view from the balcony.', priceLKR: 5000, formattedPrice: '5,000', availability: 'Available', seatingZone: 'Auditorium Balcony · Blocks F–H', benefits: ['Digital admission pass', 'Balcony seating', 'Event programme access'], maxPerOrder: 6, remainingSeats: 407 },
  { id: 'tier-premium', code: 'PREMIUM', tierName: 'Premium', subtitle: 'ODC seating with balanced stage sightlines.', priceLKR: 10000, formattedPrice: '10,000', availability: 'Available', seatingZone: 'Auditorium ODC · Blocks A & E', benefits: ['Digital admission pass', 'ODC seating', 'Priority entry'], recommended: true, maxPerOrder: 6, remainingSeats: 335 },
  { id: 'tier-vip', code: 'VIP', tierName: 'VIP', subtitle: 'Central ODC seating closest to the primary performance axis.', priceLKR: 18000, formattedPrice: '18,000', availability: 'Available', seatingZone: 'Auditorium ODC · Blocks B–D', benefits: ['Digital admission pass', 'Central ODC seating', 'Priority entry'], maxPerOrder: 6, remainingSeats: 378 },
];

export const GALLERY_ITEMS: GalleryItem[] = [];
export const PREVIOUS_EDITIONS: PreviousEdition[] = [];
