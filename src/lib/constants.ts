export const DANCE_STYLES = {
  WALTZ: { label: 'Waltz', category: 'STANDARD' },
  TANGO: { label: 'Tango', category: 'STANDARD' },
  FOXTROT: { label: 'Foxtrot', category: 'SMOOTH' },
  VIENNESE_WALTZ: { label: 'Viennese Waltz', category: 'STANDARD' },
  QUICKSTEP: { label: 'Quickstep', category: 'STANDARD' },
  CHA_CHA: { label: 'Cha Cha', category: 'RHYTHM' },
  SAMBA: { label: 'Samba', category: 'LATIN' },
  RUMBA: { label: 'Rumba', category: 'RHYTHM' },
  PASO_DOBLE: { label: 'Paso Doble', category: 'LATIN' },
  JIVE: { label: 'Jive', category: 'LATIN' },
  BOLERO: { label: 'Bolero', category: 'RHYTHM' },
  MAMBO: { label: 'Mambo', category: 'RHYTHM' },
  WEST_COAST_SWING: { label: 'West Coast Swing', category: 'RHYTHM' },
} as const

export const DANCE_LEVELS = {
  NEWCOMER: 'Newcomer',
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  NOVICE: 'Novice',
  PRE_CHAMP: 'Pre-Championship',
  CHAMPIONSHIP: 'Championship',
} as const

export const DANCE_CATEGORIES = {
  SMOOTH: 'Smooth',
  STANDARD: 'Standard',
  RHYTHM: 'Rhythm',
  LATIN: 'Latin',
} as const

export const PARTNER_STATUS_LABELS = {
  HAS_PARTNER: 'Has Partner',
  LOOKING: 'Looking for Partner',
  OPEN_TO_INQUIRIES: 'Open to Inquiries',
} as const

export const PARTNER_STATUS_COLORS = {
  HAS_PARTNER: 'bg-slate-100 text-slate-600',
  LOOKING: 'bg-gold/10 text-gold border border-gold',
  OPEN_TO_INQUIRIES: 'bg-blue-50 text-blue-600',
} as const

export const COMPETITION_FREQUENCY_LABELS = {
  RARELY: 'Rarely',
  ONE_TO_THREE: '1–3 per year',
  FOUR_TO_SIX: '4–6 per year',
  SEVEN_PLUS: '7+ per year',
} as const

export const BUDGET_RANGE_LABELS = {
  BUDGET: 'Budget-conscious',
  MODERATE: 'Moderate',
  COMPETITIVE: 'Competitive',
  UNLIMITED: 'No limit',
} as const

export const TRAVEL_WILLINGNESS_LABELS = {
  LOCAL_ONLY: 'Local only',
  REGIONAL: 'Regional',
  NATIONAL: 'National',
  INTERNATIONAL: 'International',
} as const

export const CATEGORY_COLORS = {
  STANDARD: 'bg-blue-100 text-blue-700',
  SMOOTH: 'bg-purple-100 text-purple-700',
  RHYTHM: 'bg-orange-100 text-orange-700',
  LATIN: 'bg-red-100 text-red-700',
} as const

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]
