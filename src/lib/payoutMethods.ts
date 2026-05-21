export const PAYOUT_METHODS = ['mtn', 'moov', 'celtiis', 'bmo', 'coris', 'card'] as const

export type PayoutMethod = (typeof PAYOUT_METHODS)[number]

export const PAYOUT_METHOD_OPTIONS: { value: PayoutMethod; label: string }[] = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'moov', label: 'Moov Money (Flooz)' },
  { value: 'celtiis', label: 'Celtiis' },
  { value: 'bmo', label: 'BMO' },
  { value: 'coris', label: 'Coris Money' },
  { value: 'card', label: 'Carte bancaire (Visa / Mastercard)' },
]

export function payoutMethodLabel(method: string | null | undefined): string {
  return PAYOUT_METHOD_OPTIONS.find((o) => o.value === method)?.label || method || '—'
}

export function payoutDestinationLabel(method: string): string {
  return method === 'card' ? 'Référence carte / e-mail' : 'Numéro Mobile Money'
}

export function payoutDestinationPlaceholder(method: string): string {
  if (method === 'card') {
    return 'Ex: titulaire@email.com ou Visa ****1234'
  }
  return 'Ex: +22990123456'
}
