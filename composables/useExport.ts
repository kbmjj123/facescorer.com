import type { CardResult } from '~/stores/cards'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function escapeCsv(v: string): string {
  return `"${(v ?? '').replace(/"/g, '""')}"`
}

function downloadFile(content: BlobPart, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function useExport() {
  function exportCSV(cards: CardResult[]) {
    const BOM = '﻿'
    const headers = 'First Name,Last Name,Company,Job Title,Phone,Email,Website,Address,Notes'
    const rows = cards.map(c => [
      c.fields.firstName, c.fields.lastName, c.fields.company,
      c.fields.title, c.fields.phone, c.fields.email, c.fields.website,
      c.fields.address, c.fields.notes,
    ].map(escapeCsv).join(','))

    const csv = BOM + [headers, ...rows].join('\n')
    const filename = `cardscan_contacts_${formatDate(new Date())}.csv`
    downloadFile(csv, 'text/csv;charset=utf-8', filename)
    return filename
  }

  function exportVCard(cards: CardResult[]) {
    const vcards = cards.map(c => [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${c.fields.name}`,
      `N:${c.fields.lastName};${c.fields.firstName};;;`,
      `ORG:${c.fields.company}`,
      `TITLE:${c.fields.title}`,
      `TEL;TYPE=CELL:${c.fields.phone}`,
      `EMAIL:${c.fields.email}`,
      `URL:${c.fields.website}`,
      'END:VCARD',
    ].join('\n')).join('\n')

    const filename = `cardscan_contacts_${formatDate(new Date())}.vcf`
    downloadFile(vcards, 'text/vcard;charset=utf-8', filename)
    return filename
  }

  async function exportExcel(cards: CardResult[]) {
    const XLSX = await import('xlsx')

    const data = cards.map(c => ({
      'First Name': c.fields.firstName,
      'Last Name': c.fields.lastName,
      'Company': c.fields.company,
      'Job Title': c.fields.title,
      'Phone': c.fields.phone,
      'Email': c.fields.email,
      'Website': c.fields.website,
      'Address': c.fields.address,
      'Notes': c.fields.notes,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
    const filename = `cardscan_${formatDate(new Date())}.xlsx`
    XLSX.writeFile(wb, filename)
    return filename
  }

  return { exportCSV, exportVCard, exportExcel }
}
