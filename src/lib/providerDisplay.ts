/**
 * Convertit 0/1 (MySQL) ou "0"/"1" en booléen.
 * Évite l'affichage parasite de « 0 » avec `{flag && <Component />}` en React.
 */
export function toBooleanFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function providerExperienceYears(provider: {
  experience_years?: string | number | null
  experienceYears?: string | number | null
}): number {
  const raw = provider.experienceYears ?? provider.experience_years
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function offerPriceLabel(offer: {
  price_min?: number | null
  priceMin?: number | null
  price_max?: number | null
  priceMax?: number | null
}): string | null {
  const min = Number(offer.priceMin ?? offer.price_min ?? 0)
  const max = Number(offer.priceMax ?? offer.price_max ?? 0)
  if (min > 0 && max > 0 && max !== min) {
    return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} FCFA`
  }
  if (min > 0) return `À partir de ${min.toLocaleString('fr-FR')} FCFA`
  if (max > 0) return `Jusqu'à ${max.toLocaleString('fr-FR')} FCFA`
  return null
}

export function lowestOfferPrice(
  offers: { price_min?: number | null; priceMin?: number | null }[]
): number {
  let lowest = 0
  for (const o of offers) {
    const v = Number(o.priceMin ?? o.price_min ?? 0)
    if (v > 0 && (lowest === 0 || v < lowest)) lowest = v
  }
  return lowest
}
