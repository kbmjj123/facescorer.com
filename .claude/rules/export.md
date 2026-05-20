# Export Rules

## CSV — Non-negotiable Requirements
```ts
// ALWAYS add BOM for Windows Excel compatibility
const BOM = '﻿'
// Column order must match CRM import format (HubSpot/Salesforce compatible)
const HEADERS = 'First Name,Last Name,Company,Job Title,Phone,Email,Website,Address,Notes'
// Escape: wrap all values in quotes, escape internal quotes by doubling
const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
// File naming
const filename = `cardscan_contacts_${formatDate(new Date())}.csv`
```

## vCard 3.0 — Required Fields
```
BEGIN:VCARD
VERSION:3.0
FN:{fullName}
N:{lastName};{firstName};;;
ORG:{company}
TITLE:{jobTitle}
TEL;TYPE=CELL:{phone}
EMAIL:{email}
URL:{website}
END:VCARD
```
- Multiple cards -> single `.vcf` file, cards separated by `\n`
- Test: must import into iPhone Contacts and Gmail Contacts without errors

## Excel — Pay-gated, Lazy Load
```ts
// Only import SheetJS when user has paid AND triggers export
async function exportExcel(cards: CardResult[]) {
  const XLSX = await import('xlsx')  // dynamic import — do NOT put in top-level imports
  const ws = XLSX.utils.json_to_sheet(flattenCards(cards))
  XLSX.utils.sheet_add_aoa(ws, [EXCEL_HEADERS], { origin: 'A1' })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
  XLSX.writeFile(wb, `cardscan_${formatDate(new Date())}.xlsx`)
}
```

## Download Trigger Pattern (no server)
```ts
function downloadFile(content: string | ArrayBuffer, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)  // cleanup
}
```

## Before Export — Always Validate
- At least 1 card selected (or all cards if "export all")
- Show confirmation: "Export 12 contacts to CSV?"
- After export: show success toast with filename
