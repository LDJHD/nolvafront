export type PayoutMethodOption = {
  value: string
  label: string
  region: string
  needsPhone: boolean
}

/** Tous les modes FedaPay (doc officielle — collectes & payouts, toutes régions) */
export const PAYOUT_METHOD_OPTIONS: PayoutMethodOption[] = [
  { value: 'bj_mtn', label: 'MTN Mobile Money', region: 'Bénin', needsPhone: true },
  { value: 'bj_moov', label: 'Moov Money (Flooz)', region: 'Bénin', needsPhone: true },
  { value: 'bj_celtiis', label: 'Celtiis', region: 'Bénin', needsPhone: true },
  { value: 'bj_bmo', label: 'BMO', region: 'Bénin', needsPhone: true },
  { value: 'bj_coris', label: 'Coris Money', region: 'Bénin', needsPhone: true },
  { value: 'tg_mixx_yas', label: 'Mixx By Yas', region: 'Togo', needsPhone: true },
  { value: 'tg_moov', label: 'Moov Money', region: 'Togo', needsPhone: true },
  { value: 'tg_togocom', label: 'TogoCom', region: 'Togo', needsPhone: true },
  { value: 'gn_mtn', label: 'MTN', region: 'Guinée', needsPhone: true },
  { value: 'ci_mtn', label: 'MTN', region: "Côte d'Ivoire", needsPhone: true },
  { value: 'ci_moov', label: 'Moov Money', region: "Côte d'Ivoire", needsPhone: true },
  { value: 'ci_wave', label: 'Wave', region: "Côte d'Ivoire", needsPhone: true },
  { value: 'ci_orange', label: 'Orange Money', region: "Côte d'Ivoire", needsPhone: true },
  { value: 'ne_airtel', label: 'Airtel Money', region: 'Niger', needsPhone: true },
  { value: 'sn_wave', label: 'Wave', region: 'Sénégal', needsPhone: true },
  { value: 'sn_orange', label: 'Orange Money', region: 'Sénégal', needsPhone: true },
  { value: 'sn_free', label: 'Free Sénégal', region: 'Sénégal', needsPhone: true },
  { value: 'ml_orange', label: 'Orange Money', region: 'Mali', needsPhone: true },
  { value: 'bf_moov', label: 'Moov Money', region: 'Burkina Faso', needsPhone: true },
  { value: 'bf_orange', label: 'Orange Money', region: 'Burkina Faso', needsPhone: true },
  {
    value: 'card_visa_mastercard',
    label: 'Visa / Mastercard',
    region: 'Toutes régions',
    needsPhone: false,
  },
  { value: 'mtn', label: 'MTN (ancien code)', region: 'Bénin', needsPhone: true },
  { value: 'moov', label: 'Moov (ancien code)', region: 'Bénin', needsPhone: true },
  { value: 'card', label: 'Carte (ancien code)', region: 'Toutes régions', needsPhone: false },
]

const LEGACY_LABELS: Record<string, string> = {
  mtn: 'MTN Mobile Money (Bénin)',
  moov: 'Moov Money (Bénin)',
  celtiis: 'Celtiis (Bénin)',
  bmo: 'BMO (Bénin)',
  coris: 'Coris Money (Bénin)',
  card: 'Visa / Mastercard',
}

export function payoutMethodLabel(method: string | null | undefined): string {
  const opt = PAYOUT_METHOD_OPTIONS.find((o) => o.value === method)
  if (opt) return `${opt.label} — ${opt.region}`
  return LEGACY_LABELS[method || ''] || method || '—'
}

export function payoutDestinationLabel(method: string): string {
  const opt = PAYOUT_METHOD_OPTIONS.find((o) => o.value === method)
  if (opt && !opt.needsPhone) return 'Coordonnées carte / compte'
  if (method === 'card' || method === 'card_visa_mastercard') return 'Coordonnées carte / compte'
  return 'Numéro Mobile Money'
}

export function payoutDestinationPlaceholder(method: string): string {
  const opt = PAYOUT_METHOD_OPTIONS.find((o) => o.value === method)
  if (opt && !opt.needsPhone) return 'Ex: titulaire@email.com ou Visa ****1234'
  return 'Ex: +22990123456'
}

/** Alias utilisé par l’admin (placeholder du champ coordonnées) */
export const payoutDestinationHint = payoutDestinationPlaceholder

export function payoutNeedsPhone(method: string): boolean {
  const opt = PAYOUT_METHOD_OPTIONS.find((o) => o.value === method)
  if (opt) return opt.needsPhone
  return method !== 'card' && method !== 'card_visa_mastercard'
}

export const PAYOUT_REGIONS = Array.from(
  new Set(PAYOUT_METHOD_OPTIONS.map((o) => o.region).filter((r) => !r.includes('ancien')))
)
