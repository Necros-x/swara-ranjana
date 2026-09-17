export interface VasrContributor {
  id: string;
  name: string;
  initials: string;
  roles: string[];
  shortBio: string;
  bio: string;
  image?: string;
  studioCredit?: {
    label: string;
    name: string;
    url: string;
  };
}

export const VASR_CONTRIBUTORS: VasrContributor[] = [
  {
    id: 'ramika-perera',
    name: 'Ramika Perera',
    initials: 'RP',
    roles: ['Developer', 'Animation Creator'],
    shortBio:
      'Building the digital experience and motion language behind Swara Ranjana.',
    bio:
      'Ramika Perera works across development and animation for Swara Ranjana, connecting the concert’s visual identity with its digital experience and motion-led presentation. His contribution focuses on turning the project’s creative direction into interactive and animated experiences across the event’s digital touchpoints.',
    studioCredit: {
      label: 'Digital experience & animation production',
      name: 'NECROS Studio',
      url: 'https://studio.necros.co',
    },
  },
  {
    id: 'thenula-herath',
    name: 'Thenula Herath',
    initials: 'TH',
    roles: ['Animation Creator', 'Visual Art Creator'],
    shortBio:
      'Creating animation and original visual artwork for the visual world of Swara Ranjana.',
    bio:
      'Thenula Herath contributes animation and original visual artwork to Swara Ranjana, translating the concert’s musical identity into motion-led compositions and visual pieces. His work helps shape the atmosphere surrounding the performance beyond the stage itself.',
  },
];
