import { Dancer, DanceStyle } from '@prisma/client'

type DancerWithStyles = Dancer & { danceStyles: DanceStyle[] }

export interface MatchResult {
  score: number
  reasons: string[]
  mode: 'amateur' | 'proam'
}

const LEVEL_ORDER = [
  'NEWCOMER', 'BRONZE', 'SILVER', 'GOLD', 'NOVICE', 'PRE_CHAMP', 'CHAMPIONSHIP'
]

function levelDistance(a: string, b: string): number {
  const ai = LEVEL_ORDER.indexOf(a)
  const bi = LEVEL_ORDER.indexOf(b)
  if (ai === -1 || bi === -1) return 10
  return Math.abs(ai - bi)
}

function sharedStyles(d1: DanceStyle[], d2: DanceStyle[]): string[] {
  const s1 = new Set(d1.map(s => s.style))
  return d2.filter(s => s1.has(s.style)).map(s => s.style)
}

function frequencyScore(f1?: string | null, f2?: string | null): number {
  if (!f1 || !f2) return 7
  const order = ['RARELY', 'ONE_TO_THREE', 'FOUR_TO_SIX', 'SEVEN_PLUS']
  const d = Math.abs(order.indexOf(f1) - order.indexOf(f2))
  if (d === 0) return 15
  if (d === 1) return 10
  if (d === 2) return 5
  return 0
}

function budgetScore(b1?: string | null, b2?: string | null): number {
  if (!b1 || !b2) return 5
  const order = ['BUDGET', 'MODERATE', 'COMPETITIVE', 'UNLIMITED']
  const d = Math.abs(order.indexOf(b1) - order.indexOf(b2))
  if (d === 0) return 10
  if (d === 1) return 7
  if (d === 2) return 3
  return 0
}

function partnershipOverlap(p1: string[], p2: string[]): number {
  const s1 = new Set(p1)
  const overlap = p2.filter(p => s1.has(p)).length
  return overlap > 0 ? 5 : 0
}

// Simplified geographic score (no actual distance calc without geocoding)
function geoScore(d1: DancerWithStyles, d2: DancerWithStyles): { score: number; reason: string } {
  if (!d1.state || !d2.state) return { score: 5, reason: 'Location not specified' }
  if (d1.city && d2.city && d1.city === d2.city) {
    return { score: 20, reason: `Both in ${d1.city}` }
  }
  if (d1.state === d2.state) {
    return { score: 15, reason: `Both in ${d1.state}` }
  }
  return { score: 0, reason: 'Different states' }
}

export function calculateMatchScore(dancer1: DancerWithStyles, dancer2: DancerWithStyles): MatchResult {
  const isProAm =
    dancer1.partnershipType.includes('PRO_AM' as any) &&
    dancer2.isTeacher &&
    dancer2.openToProAm

  if (isProAm) {
    return calculateProAmScore(dancer1, dancer2)
  }
  return calculateAmateurScore(dancer1, dancer2)
}

function calculateAmateurScore(d1: DancerWithStyles, d2: DancerWithStyles): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Shared styles: +30 (hard requirement)
  const shared = sharedStyles(d1.danceStyles, d2.danceStyles)
  if (shared.length === 0) return { score: 0, reasons: ['No shared dance styles'], mode: 'amateur' }

  score += 30
  reasons.push(`Shares ${shared.length} dance style${shared.length > 1 ? 's' : ''}: ${shared.slice(0, 3).join(', ')}`)

  // Level compatibility: +20
  const d1Levels = d1.danceStyles.map(s => s.level)
  const d2Levels = d2.danceStyles.filter(s => shared.includes(s.style)).map(s => s.level)
  const minDist = d1Levels.reduce((min, l1) => {
    return d2Levels.reduce((m, l2) => Math.min(m, levelDistance(l1, l2)), min)
  }, 10)
  if (minDist === 0) { score += 20; reasons.push('Same competition level') }
  else if (minDist === 1) { score += 15; reasons.push('Compatible competition levels') }
  else if (minDist === 2) { score += 8; reasons.push('Close competition levels') }

  // Geography: +20
  const geo = geoScore(d1, d2)
  score += geo.score
  if (geo.score > 0) reasons.push(geo.reason)

  // Competition frequency: +15
  const freqScore = frequencyScore(d1.competitionFrequency, d2.competitionFrequency)
  score += freqScore
  if (freqScore >= 10) reasons.push('Similar competition schedule')

  // Budget: +10
  const bScore = budgetScore(d1.budgetRange, d2.budgetRange)
  score += bScore
  if (bScore >= 7) reasons.push('Compatible budget range')

  // Partnership overlap: +5
  const pScore = partnershipOverlap(d1.partnershipType as string[], d2.partnershipType as string[])
  score += pScore
  if (pScore > 0) reasons.push('Compatible partnership goals')

  return { score: Math.min(score, 100), reasons, mode: 'amateur' }
}

function calculateProAmScore(dancer: DancerWithStyles, teacher: DancerWithStyles): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Style overlap: +40
  const shared = sharedStyles(dancer.danceStyles, teacher.danceStyles)
  if (shared.length === 0) return { score: 0, reasons: ['No shared dance styles'], mode: 'proam' }
  score += Math.min(40, shared.length * 15)
  reasons.push(`Teacher specializes in: ${shared.slice(0, 3).join(', ')}`)

  // Location / travel willingness: +30
  if (!dancer.state || !teacher.state) {
    score += 15
  } else if (dancer.state === teacher.state) {
    score += 30
    reasons.push('Local teacher')
  } else if (teacher.travelWillingness === 'NATIONAL' || teacher.travelWillingness === 'INTERNATIONAL') {
    score += 20
    reasons.push('Teacher travels nationally')
  } else if (teacher.travelWillingness === 'REGIONAL') {
    score += 10
    reasons.push('Teacher travels regionally')
  }

  // Teacher level vs dancer: +30
  const dancerLevels = dancer.danceStyles.map(s => s.level)
  const teacherLevels = teacher.danceStyles.map(s => s.level)
  const fits = dancerLevels.some(dl =>
    teacherLevels.some(tl => levelDistance(dl, tl) <= 2)
  )
  if (fits) {
    score += 30
    reasons.push('Level is a good fit')
  }

  return { score: Math.min(score, 100), reasons, mode: 'proam' }
}
