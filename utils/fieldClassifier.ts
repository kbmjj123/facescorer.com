import type { CardFields } from '~/stores/cards'

interface ClassifiedField {
  field: keyof CardFields
  value: string
  confidence: number
}

const TITLE_KEYWORDS = [
  'CEO', 'CTO', 'CFO', 'COO', 'CIO', 'CMO', 'VP', 'President',
  'Manager', 'Director', 'Engineer', 'Sales', 'Marketing', 'Consultant',
  'Representative', 'Specialist', 'Coordinator', 'Analyst', 'Developer',
  'Designer', 'Architect', 'Lead', 'Head', 'Chief', 'Principal', 'Senior',
  'Junior', 'Associate', 'Assistant', 'Partner', 'Founder', 'Owner',
  '总监', '经理', '主任', '工程师', '主管', '代表', '顾问',
  '副总裁', '总裁', '董事长', '总经理', '院长', '教授',
  '销售', '市场', '技术', '研发', '设计', '财务',
]

const COMPANY_SUFFIXES = [
  'Inc.', 'Inc', 'LLC', 'Corp.', 'Corp', 'Co., Ltd', 'Co., Ltd.',
  'Limited', 'Ltd.', 'Ltd', 'Group', 'Holding', 'Holdings',
  '有限公司', '股份有限公司', '集团', '科技', '网络', '信息',
  '技术', '软件', '数据', '医疗', '教育', '咨询', '文化',
  '传媒', '贸易', '实业', '投资', '发展',
]

const PHONE_REGEX = /^(\+?\d{1,3}[-\s.]?)?\(?\d{2,4}\)?[-\s.]?\d{2,4}[-\s.]?\d{2,4}[-\s.]?\d{2,4}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WEBSITE_REGEX = /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+(\.?[\w-]+)*\/?.*$/i

export function classifyFields(textLines: string[]): Map<string, ClassifiedField> {
  const fields = new Map<string, ClassifiedField>()

  // Filter empty lines
  const lines = textLines.map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return fields

  const classified = new Set<string>()

  // Pass 1: regex matches (high confidence)
  for (const line of lines) {
    const cleaned = line.replace(/^[:\s]+|[:\s]+$/g, '')

    if (!classified.has(line) && EMAIL_REGEX.test(cleaned)) {
      fields.set('email', { field: 'email', value: cleaned.toLowerCase(), confidence: 0.95 })
      classified.add(line)
    } else if (!classified.has(line) && WEBSITE_REGEX.test(cleaned) && cleaned.includes('.')) {
      fields.set('website', { field: 'website', value: cleaned, confidence: 0.9 })
      classified.add(line)
    } else if (!classified.has(line) && PHONE_REGEX.test(cleaned.replace(/\s/g, ''))) {
      fields.set('phone', { field: 'phone', value: cleaned, confidence: 0.9 })
      classified.add(line)
    }
  }

  // Pass 2: keyword matching for title and company
  const remaining = lines.filter(l => !classified.has(l))
  for (const line of remaining) {
    // Check for title
    const titleMatch = TITLE_KEYWORDS.some(kw => line.toLowerCase().includes(kw.toLowerCase()))
    if (titleMatch && !fields.has('title')) {
      fields.set('title', { field: 'title', value: line, confidence: 0.75 })
      classified.add(line)
      continue
    }

    // Check for company
    const companyMatch = COMPANY_SUFFIXES.some(s => line.toLowerCase().includes(s.toLowerCase()))
    if (companyMatch && !fields.has('company')) {
      fields.set('company', { field: 'company', value: line, confidence: 0.8 })
      classified.add(line)
      continue
    }
  }

  // Pass 3: heuristics for name (shortest remaining line, 2-4 chars for Chinese or 2 words for English)
  const leftovers = lines.filter(l => !classified.has(l))
  if (leftovers.length > 0 && !fields.has('name')) {
    // Chinese name: 2-4 characters
    const chineseName = leftovers.find(l => /^[一-鿿]{2,4}$/.test(l))
    if (chineseName) {
      fields.set('name', { field: 'name', value: chineseName, confidence: 0.7 })
      classified.add(chineseName)
    } else {
      // English name: two words, each starting with capital
      const englishName = leftovers.find(l => /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(l))
      if (englishName) {
        fields.set('name', { field: 'name', value: englishName, confidence: 0.7 })
        classified.add(englishName)
      } else if (leftovers.length > 0) {
        // Fallback: use the shortest line as name
        const shortest = leftovers.reduce((a, b) => a.length < b.length ? a : b)
        fields.set('name', { field: 'name', value: shortest!, confidence: 0.5 })
      }
    }
  }

  // Pass 4: assign remaining lines to address or notes
  const unclassified = lines.filter(l => !classified.has(l))
  if (unclassified.length > 0) {
    // Longest line is likely address
    const longest = unclassified.reduce((a, b) => a.length > b.length ? a : b)
    fields.set('address', { field: 'address', value: longest, confidence: 0.4 })
  }

  return fields
}

// Extract full classification result, splitting name into first/last
export function classifyToFields(textLines: string[]): {
  fields: Partial<CardFields>
  confidence: Record<string, number>
} {
  const classified = classifyFields(textLines)
  const fields: Partial<CardFields> = {}
  const confidence: Record<string, number> = {}

  for (const [key, item] of classified) {
    const k = key as keyof CardFields
    if (k === 'name') {
      fields.name = item.value
      // Split into first/last name
      const parts = item.value.split(/\s+/)
      if (parts.length >= 2) {
        fields.firstName = parts[0]!
        fields.lastName = parts[parts.length - 1]!
      } else {
        fields.firstName = item.value
        fields.lastName = ''
      }
      confidence.name = item.confidence
    } else {
      ;(fields as Record<string, string>)[k] = item.value
      confidence[k] = item.confidence
    }
  }

  return { fields, confidence }
}
