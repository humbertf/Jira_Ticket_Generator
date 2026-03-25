import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Sprints ──────────────────────────────────────────────────────────────
  const sprintsData = [
    { sprintIndex: 8,  sprintId: 198334, epicName: 'DAG-816',  startMonth: 7,    startDay: 3,    startYear: 2025, endMonth: 7,    endDay: 16,   endYear: 2025 },
    { sprintIndex: 9,  sprintId: 198856, epicName: 'DAG-969',  startMonth: 7,    startDay: 17,   startYear: 2025, endMonth: 7,    endDay: 30,   endYear: 2025 },
    { sprintIndex: 10, sprintId: 198918, epicName: 'DAG-970',  startMonth: 7,    startDay: 31,   startYear: 2025, endMonth: 8,    endDay: 13,   endYear: 2025 },
    { sprintIndex: 11, sprintId: 198920, epicName: 'DAG-971',  startMonth: 8,    startDay: 14,   startYear: 2025, endMonth: 8,    endDay: 27,   endYear: 2025 },
    { sprintIndex: 12, sprintId: 201578, epicName: 'DAG-972',  startMonth: 8,    startDay: 28,   startYear: 2025, endMonth: 9,    endDay: 10,   endYear: 2025 },
    { sprintIndex: 13, sprintId: 202014, epicName: 'DAG-973',  startMonth: 9,    startDay: 11,   startYear: 2025, endMonth: 9,    endDay: 24,   endYear: 2025 },
    { sprintIndex: 14, sprintId: 202839, epicName: 'DAG-974',  startMonth: 9,    startDay: 25,   startYear: 2025, endMonth: 10,   endDay: 8,    endYear: 2025 },
    { sprintIndex: 15, sprintId: 203599, epicName: 'DAG-975',  startMonth: 10,   startDay: 9,    startYear: 2025, endMonth: 10,   endDay: 22,   endYear: 2025 },
    { sprintIndex: 16, sprintId: 203600, epicName: 'DAG-976',  startMonth: 10,   startDay: 23,   startYear: 2025, endMonth: 11,   endDay: 5,    endYear: 2025 },
    { sprintIndex: 17, sprintId: 203601, epicName: 'DAG-977',  startMonth: 11,   startDay: 6,    startYear: 2025, endMonth: 11,   endDay: 19,   endYear: 2025 },
    { sprintIndex: 18, sprintId: 207018, epicName: 'DAG-1544', startMonth: 11,   startDay: 27,   startYear: 2025, endMonth: 12,   endDay: 10,   endYear: 2025 },
    { sprintIndex: 19, sprintId: 207628, epicName: 'DAG-1545', startMonth: null, startDay: null, startYear: null, endMonth: null, endDay: null, endYear: null },
    { sprintIndex: 20, sprintId: 207629, epicName: 'DAG-1546', startMonth: null, startDay: null, startYear: null, endMonth: null, endDay: null, endYear: null },
    { sprintIndex: 21, sprintId: 207630, epicName: 'DAG-1701', startMonth: null, startDay: null, startYear: null, endMonth: null, endDay: null, endYear: null },
    { sprintIndex: 22, sprintId: 212384, epicName: 'DAG-1702', startMonth: null, startDay: null, startYear: null, endMonth: null, endDay: null, endYear: null },
    { sprintIndex: 23, sprintId: 211302, epicName: 'DAG-1830', startMonth: 2,    startDay: 24,   startYear: 2026, endMonth: 3,    endDay: 9,    endYear: 2026 },
    { sprintIndex: 24, sprintId: 213731, epicName: 'DAG-1886', startMonth: 3,    startDay: 10,   startYear: 2026, endMonth: 3,    endDay: 23,   endYear: 2026 },
    { sprintIndex: 25, sprintId: 213732, epicName: 'DAG-1887', startMonth: 3,    startDay: 24,   startYear: 2026, endMonth: 4,    endDay: 6,    endYear: 2026 },
    { sprintIndex: 26, sprintId: 214372, epicName: 'DAG-1898', startMonth: 4,    startDay: 7,    startYear: 2026, endMonth: 4,    endDay: 20,   endYear: 2026 },
    { sprintIndex: 27, sprintId: 214373, epicName: 'DAG-1899', startMonth: 4,    startDay: 21,   startYear: 2026, endMonth: 5,    endDay: 4,    endYear: 2026 },
    { sprintIndex: 28, sprintId: 214374, epicName: 'DAG-1900', startMonth: 5,    startDay: 5,    startYear: 2026, endMonth: 5,    endDay: 18,   endYear: 2026 },
  ]

  for (const s of sprintsData) {
    await prisma.sprint.upsert({
      where:  { sprintIndex: s.sprintIndex },
      update: { ...s, issueType: 'Story' },
      create: { ...s, issueType: 'Story' },
    })
  }
  console.log(`  ✓ ${sprintsData.length} sprints`)

  // ── Personas ─────────────────────────────────────────────────────────────
  const personaLabels = [
    'As a General User',
    'As a POCL User',
    'As a Security User',
    'As a Glossary User',
    'As an Admin',
    'As an Auditor',
    'As a Data Steward',
    'As a Data Owner',
    'As a Data Custodian',
    'As a Compliance Officer',
    'As a Risk Manager',
    'As a Privacy Officer',
    'As a Business Analyst',
    'As a Technical Analyst',
    'As an Integration Specialist',
    'As a Metadata Manager',
    'As a System Administrator',
    'As a Knowledge Manager',
    'As a Legal Reviewer',
    'As an Adobe Leader',
    'As an user referenced (@mentioned) in a comment',
    'As a Governance Insight user',
    'As a Label Management User',
    'As a Data Governance Platform Engineer',
  ]

  for (let i = 0; i < personaLabels.length; i++) {
    await prisma.persona.upsert({
      where:  { label: personaLabels[i] },
      update: { sortOrder: i + 1 },
      create: { label: personaLabels[i], sortOrder: i + 1 },
    })
  }
  console.log(`  ✓ ${personaLabels.length} personas`)

  // ── Prefixes ──────────────────────────────────────────────────────────────
  const prefixCodes = [
    'DEV', 'ENH', 'FIX', 'SUPPORT', 'INFRA', 'TEST',
    'REFACTOR', 'ETL', 'DQ', 'MODEL', 'ANALYSIS', 'METADATA', 'DOC',
  ]

  for (let i = 0; i < prefixCodes.length; i++) {
    await prisma.prefix.upsert({
      where:  { code: prefixCodes[i] },
      update: { sortOrder: i + 1 },
      create: { code: prefixCodes[i], sortOrder: i + 1 },
    })
  }
  console.log(`  ✓ ${prefixCodes.length} prefixes`)

  // ── Assignees ─────────────────────────────────────────────────────────────
  const assigneeUsernames = [
    'all40251', 'chirags', 'archigup', 'shwetathakur',
    'padalia', 'chheatry', 'humbertf', 'ajajoo',
  ]

  for (const username of assigneeUsernames) {
    await prisma.assignee.upsert({
      where:  { username },
      update: {},
      create: { username },
    })
  }
  console.log(`  ✓ ${assigneeUsernames.length} assignees`)

  // ── Components ────────────────────────────────────────────────────────────
  const componentNames = [
    'Frontend', 'Backend', 'Database', 'API',
    'Infrastructure', 'ETL Pipeline', 'Reports', 'Security',
  ]

  for (let i = 0; i < componentNames.length; i++) {
    await prisma.component.upsert({
      where:  { name: componentNames[i] },
      update: { sortOrder: i + 1 },
      create: { name: componentNames[i], sortOrder: i + 1 },
    })
  }
  console.log(`  ✓ ${componentNames.length} components`)

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
