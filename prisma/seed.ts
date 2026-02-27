import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEACHERS = [
  {
    firstName: 'Elena', lastName: 'Volkov',
    email: 'elena.volkov@example.com',
    city: 'Las Vegas', state: 'NV',
    bio: 'World-class competitive ballroom dancer and teacher. Former World Latin Champion. Specializing in Latin and Rhythm styles.',
    teacherBio: 'Over 20 years of teaching experience. Trained dancers to championship level across the country. Welcoming new Pro-Am students.',
    studioName: 'Volkov Dance Academy',
    studioAddress: '3400 Las Vegas Blvd S',
    studioCity: 'Las Vegas',
    studioState: 'NV',
    travelWillingness: 'NATIONAL',
    openToProAm: true,
    styles: [
      { style: 'CHA_CHA', level: 'CHAMPIONSHIP' },
      { style: 'SAMBA', level: 'CHAMPIONSHIP' },
      { style: 'RUMBA', level: 'CHAMPIONSHIP' },
      { style: 'PASO_DOBLE', level: 'CHAMPIONSHIP' },
      { style: 'JIVE', level: 'CHAMPIONSHIP' },
    ],
    lessonRates: {
      privateLessonPerHour: 150,
      packageRates: [
        { sessions: 5, price: 700, description: '5-lesson package' },
        { sessions: 10, price: 1300, description: '10-lesson package' },
      ],
      proAmCompRate: '$150/hour + travel expenses',
      currency: 'USD',
      ratesPublic: true,
    },
  },
  {
    firstName: 'Marco', lastName: 'Reyes',
    email: 'marco.reyes@example.com',
    city: 'Miami', state: 'FL',
    bio: 'International Latin finalist and choreographer. Bringing artistry and technique to every lesson.',
    teacherBio: 'Certified ballroom instructor with 15 years experience. Specializing in Latin dances and Pro-Am partnerships.',
    studioName: 'Reyes Latin Dance',
    studioAddress: '1200 Brickell Ave',
    studioCity: 'Miami',
    studioState: 'FL',
    travelWillingness: 'INTERNATIONAL',
    openToProAm: true,
    styles: [
      { style: 'CHA_CHA', level: 'CHAMPIONSHIP' },
      { style: 'SAMBA', level: 'CHAMPIONSHIP' },
      { style: 'RUMBA', level: 'CHAMPIONSHIP' },
      { style: 'BOLERO', level: 'CHAMPIONSHIP' },
    ],
    lessonRates: {
      privateLessonPerHour: 120,
      packageRates: [
        { sessions: 4, price: 440, description: '4-lesson intro package' },
        { sessions: 12, price: 1200, description: '12-lesson package' },
      ],
      proAmCompRate: 'Contact for quote',
      currency: 'USD',
      ratesPublic: true,
    },
  },
  {
    firstName: 'Sophie', lastName: 'Laurent',
    email: 'sophie.laurent@example.com',
    city: 'Chicago', state: 'IL',
    bio: 'Former French champion, now teaching in Chicago. Specializing in Standard and Smooth.',
    teacherBio: 'Elegant technique, passionate teaching. My students regularly place at national competitions.',
    studioName: 'Laurent Ballroom',
    studioAddress: '55 W Monroe St',
    studioCity: 'Chicago',
    studioState: 'IL',
    travelWillingness: 'NATIONAL',
    openToProAm: true,
    styles: [
      { style: 'WALTZ', level: 'CHAMPIONSHIP' },
      { style: 'TANGO', level: 'CHAMPIONSHIP' },
      { style: 'FOXTROT', level: 'CHAMPIONSHIP' },
      { style: 'VIENNESE_WALTZ', level: 'CHAMPIONSHIP' },
      { style: 'QUICKSTEP', level: 'CHAMPIONSHIP' },
    ],
    lessonRates: {
      privateLessonPerHour: 130,
      packageRates: [
        { sessions: 5, price: 600, description: '5-lesson package' },
      ],
      proAmCompRate: '$130/hour + competition fees',
      currency: 'USD',
      ratesPublic: true,
    },
  },
]

const AMATEUR_DANCERS = [
  {
    firstName: 'Sarah', lastName: 'Mitchell',
    email: 'sarah.mitchell@example.com',
    city: 'Columbus', state: 'OH',
    bio: 'Started dancing 3 years ago and completely hooked. Looking for a Gold/Novice partner for Smooth.',
    partnerStatus: 'LOOKING',
    partnershipType: ['AMATEUR_AMATEUR'],
    competitionFrequency: 'FOUR_TO_SIX',
    budgetRange: 'MODERATE',
    birthYear: 1992,
    heightInches: 65,
    studioName: 'Ohio Ballroom Academy',
    styles: [
      { style: 'WALTZ', level: 'GOLD', isCompeting: true },
      { style: 'FOXTROT', level: 'GOLD', isCompeting: true },
      { style: 'TANGO', level: 'SILVER', wantsToCompete: true },
    ],
  },
  {
    firstName: 'James', lastName: 'Okafor',
    email: 'james.okafor@example.com',
    city: 'Houston', state: 'TX',
    bio: 'Competitive Latin dancer working toward Novice. Serious about improving and competing regularly.',
    partnerStatus: 'LOOKING',
    partnershipType: ['AMATEUR_AMATEUR'],
    competitionFrequency: 'SEVEN_PLUS',
    budgetRange: 'COMPETITIVE',
    birthYear: 1988,
    heightInches: 71,
    studioName: 'Texas Ballroom Center',
    styles: [
      { style: 'CHA_CHA', level: 'GOLD', isCompeting: true },
      { style: 'RUMBA', level: 'GOLD', isCompeting: true },
      { style: 'SAMBA', level: 'SILVER', isCompeting: true },
    ],
  },
  {
    firstName: 'Rachel', lastName: 'Chen',
    email: 'rachel.chen@example.com',
    city: 'Seattle', state: 'WA',
    bio: 'Software engineer by day, ballroom dancer by night. Bronze standard dancer looking for a partner.',
    partnerStatus: 'LOOKING',
    partnershipType: ['AMATEUR_AMATEUR', 'PRACTICE_ONLY'],
    competitionFrequency: 'ONE_TO_THREE',
    budgetRange: 'MODERATE',
    birthYear: 1994,
    heightInches: 63,
    styles: [
      { style: 'WALTZ', level: 'BRONZE', isCompeting: false, wantsToCompete: true },
      { style: 'QUICKSTEP', level: 'BRONZE', isCompeting: false, wantsToCompete: true },
    ],
  },
  {
    firstName: 'David', lastName: 'Kowalski',
    email: 'david.kowalski@example.com',
    city: 'Chicago', state: 'IL',
    bio: 'Championship-level standard dancer returning after a 2-year break. Looking for serious partner.',
    partnerStatus: 'LOOKING',
    partnershipType: ['AMATEUR_AMATEUR'],
    competitionFrequency: 'SEVEN_PLUS',
    budgetRange: 'UNLIMITED',
    birthYear: 1985,
    heightInches: 73,
    studioName: 'Windy City Ballroom',
    styles: [
      { style: 'WALTZ', level: 'CHAMPIONSHIP', isCompeting: false },
      { style: 'TANGO', level: 'CHAMPIONSHIP', isCompeting: false },
      { style: 'FOXTROT', level: 'PRE_CHAMP', isCompeting: false },
      { style: 'VIENNESE_WALTZ', level: 'PRE_CHAMP', isCompeting: false },
    ],
  },
  {
    firstName: 'Maya', lastName: 'Patel',
    email: 'maya.patel@example.com',
    city: 'Atlanta', state: 'GA',
    bio: 'Rhythm and Latin dancer. Competed through Silver nationally. Now looking for a new Pro-Am teacher.',
    partnerStatus: 'OPEN_TO_INQUIRIES',
    partnershipType: ['PRO_AM'],
    competitionFrequency: 'FOUR_TO_SIX',
    budgetRange: 'COMPETITIVE',
    birthYear: 1990,
    heightInches: 64,
    styles: [
      { style: 'CHA_CHA', level: 'SILVER', isCompeting: true },
      { style: 'RUMBA', level: 'SILVER', isCompeting: true },
      { style: 'BOLERO', level: 'BRONZE', wantsToCompete: true },
    ],
  },
  {
    firstName: 'Kevin', lastName: 'Thompson',
    email: 'kevin.thompson@example.com',
    city: 'Denver', state: 'CO',
    bio: 'Newcomer to competitive dance, 1 year in. Loving every minute. Looking for practice partner.',
    partnerStatus: 'LOOKING',
    partnershipType: ['PRACTICE_ONLY', 'AMATEUR_AMATEUR'],
    competitionFrequency: 'ONE_TO_THREE',
    budgetRange: 'BUDGET',
    birthYear: 1998,
    heightInches: 70,
    styles: [
      { style: 'WALTZ', level: 'NEWCOMER', wantsToCompete: true },
      { style: 'CHA_CHA', level: 'NEWCOMER', wantsToCompete: true },
    ],
  },
  {
    firstName: 'Laura', lastName: 'Sinclair',
    email: 'laura.sinclair@example.com',
    city: 'Boston', state: 'MA',
    bio: 'Pre-championship smooth dancer. Have placed nationally. Committed partner preferred.',
    partnerStatus: 'OPEN_TO_INQUIRIES',
    partnershipType: ['AMATEUR_AMATEUR'],
    competitionFrequency: 'SEVEN_PLUS',
    budgetRange: 'COMPETITIVE',
    birthYear: 1987,
    heightInches: 66,
    studioName: 'Boston Ballroom',
    styles: [
      { style: 'WALTZ', level: 'PRE_CHAMP', isCompeting: true },
      { style: 'FOXTROT', level: 'PRE_CHAMP', isCompeting: true },
      { style: 'TANGO', level: 'NOVICE', isCompeting: true },
    ],
  },
  {
    firstName: 'Andre', lastName: 'Williams',
    email: 'andre.williams@example.com',
    city: 'Los Angeles', state: 'CA',
    bio: 'Latin dancer with international experience. Currently without a partner and ready to compete.',
    partnerStatus: 'LOOKING',
    partnershipType: ['AMATEUR_AMATEUR'],
    competitionFrequency: 'SEVEN_PLUS',
    budgetRange: 'UNLIMITED',
    birthYear: 1983,
    heightInches: 72,
    styles: [
      { style: 'CHA_CHA', level: 'NOVICE', isCompeting: false },
      { style: 'SAMBA', level: 'NOVICE', isCompeting: false },
      { style: 'RUMBA', level: 'GOLD', isCompeting: false },
      { style: 'JIVE', level: 'GOLD', isCompeting: false },
    ],
  },
]

const SEEDED_UNCLAIMED = [
  {
    firstName: 'Katherine', lastName: 'Brooks',
    email: 'kbrooks.dance@noreply.com',
    city: 'Orlando', state: 'FL',
    ndcaId: 'NDCA-12345',
    styles: [
      { style: 'WALTZ', level: 'NOVICE' },
      { style: 'TANGO', level: 'NOVICE' },
    ],
  },
  {
    firstName: 'Michael', lastName: 'Santos',
    email: 'msantos.dance@noreply.com',
    city: 'Phoenix', state: 'AZ',
    ndcaId: 'NDCA-67890',
    styles: [
      { style: 'CHA_CHA', level: 'SILVER' },
      { style: 'RUMBA', level: 'BRONZE' },
    ],
  },
  {
    firstName: 'Jennifer', lastName: 'Park',
    email: 'jpark.dance@noreply.com',
    city: 'Minneapolis', state: 'MN',
    ndcaId: 'NDCA-11111',
    styles: [
      { style: 'FOXTROT', level: 'GOLD' },
      { style: 'QUICKSTEP', level: 'SILVER' },
    ],
  },
  {
    firstName: 'Robert', lastName: 'Martinez',
    email: 'rmartinez.dance@noreply.com',
    city: 'San Antonio', state: 'TX',
    ndcaId: 'NDCA-22222',
    styles: [
      { style: 'SAMBA', level: 'BRONZE' },
      { style: 'CHA_CHA', level: 'BRONZE' },
    ],
  },
  {
    firstName: 'Emily', lastName: 'Johnson',
    email: 'ejohnson.dance@noreply.com',
    city: 'Nashville', state: 'TN',
    ndcaId: 'NDCA-33333',
    styles: [
      { style: 'WALTZ', level: 'SILVER' },
      { style: 'FOXTROT', level: 'BRONZE' },
    ],
  },
]

const COMPETITION_RESULTS = [
  { competitionName: 'Ohio Star Ball', competitionDate: new Date('2024-11-15'), location: 'Columbus, OH', style: 'WALTZ', level: 'GOLD', placement: 2, totalCompetitors: 8 },
  { competitionName: 'Emerald Ball', competitionDate: new Date('2024-05-10'), location: 'Los Angeles, CA', style: 'FOXTROT', level: 'GOLD', placement: 1, totalCompetitors: 6 },
  { competitionName: 'Ohio Star Ball', competitionDate: new Date('2023-11-17'), location: 'Columbus, OH', style: 'WALTZ', level: 'SILVER', placement: 3, totalCompetitors: 12 },
]

async function main() {
  console.log('🌱 Seeding FilledCard database...\n')

  // Clear existing data
  await prisma.teacherReview.deleteMany()
  await prisma.partnerRequest.deleteMany()
  await prisma.message.deleteMany()
  await prisma.video.deleteMany()
  await prisma.competitionResult.deleteMany()
  await prisma.danceStyle.deleteMany()
  await prisma.dancer.deleteMany()

  // Seed teachers
  console.log('👩‍🏫 Creating teachers...')
  for (const t of TEACHERS) {
    const { styles, lessonRates, ...rest } = t
    const dancer = await prisma.dancer.create({
      data: {
        ...rest,
        travelWillingness: rest.travelWillingness as any,
        isTeacher: true,
        teacherVerified: true,
        isClaimed: true,
        partnerStatus: 'OPEN_TO_INQUIRIES',
        partnershipType: ['PRO_AM'],
        lessonRates: lessonRates as any,
        danceStyles: {
          create: styles.map(s => ({
            style: s.style as any,
            category: getCategoryForStyle(s.style),
            level: s.level as any,
            isCompeting: false,
            wantsToCompete: false,
          })),
        },
      },
    })
    console.log(`  ✓ ${dancer.firstName} ${dancer.lastName} (teacher)`)
  }

  // Seed amateur dancers
  console.log('\n💃 Creating amateur dancers...')
  for (const d of AMATEUR_DANCERS) {
    const { styles, ...rest } = d
    const dancer = await prisma.dancer.create({
      data: {
        ...rest as any,
        isClaimed: true,
        danceStyles: {
          create: styles.map(s => ({
            style: s.style as any,
            category: getCategoryForStyle(s.style),
            level: s.level as any,
            isCompeting: (s as any).isCompeting || false,
            wantsToCompete: (s as any).wantsToCompete || false,
          })),
        },
      },
    })

    // Add competition results to first dancer
    if (dancer.firstName === 'Sarah') {
      for (const result of COMPETITION_RESULTS) {
        await prisma.competitionResult.create({
          data: { ...result, dancerId: dancer.id, source: 'MANUAL' },
        })
      }
    }

    console.log(`  ✓ ${dancer.firstName} ${dancer.lastName}`)
  }

  // Seed unclaimed profiles
  console.log('\n👻 Creating unclaimed seeded profiles...')
  for (const u of SEEDED_UNCLAIMED) {
    const { styles, ...rest } = u
    const dancer = await prisma.dancer.create({
      data: {
        ...rest,
        isClaimed: false,
        isTeacher: false,
        partnerStatus: 'OPEN_TO_INQUIRIES',
        danceStyles: {
          create: styles.map(s => ({
            style: s.style as any,
            category: getCategoryForStyle(s.style),
            level: s.level as any,
            isCompeting: false,
            wantsToCompete: false,
          })),
        },
      },
    })
    console.log(`  ✓ ${dancer.firstName} ${dancer.lastName} (unclaimed)`)
  }

  const summary = await prisma.dancer.count()
  const claimed = await prisma.dancer.count({ where: { isClaimed: true } })
  const unclaimed = await prisma.dancer.count({ where: { isClaimed: false } })
  const teachers = await prisma.dancer.count({ where: { isTeacher: true } })
  const results = await prisma.competitionResult.count()

  console.log('\n✅ Seed complete!')
  console.log(`   Total dancers: ${summary}`)
  console.log(`   Claimed: ${claimed} | Unclaimed: ${unclaimed}`)
  console.log(`   Teachers: ${teachers}`)
  console.log(`   Competition results: ${results}`)
}

function getCategoryForStyle(style: string): any {
  const map: Record<string, string> = {
    WALTZ: 'STANDARD',
    TANGO: 'STANDARD',
    FOXTROT: 'SMOOTH',
    VIENNESE_WALTZ: 'STANDARD',
    QUICKSTEP: 'STANDARD',
    CHA_CHA: 'RHYTHM',
    SAMBA: 'LATIN',
    RUMBA: 'RHYTHM',
    PASO_DOBLE: 'LATIN',
    JIVE: 'LATIN',
    BOLERO: 'RHYTHM',
    MAMBO: 'RHYTHM',
    WEST_COAST_SWING: 'RHYTHM',
  }
  return map[style] || 'STANDARD'
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
