export function getProviderTypeLabel(
  provider: any,
  typeCatalog?: { slug: string; label: string }[]
): string {
  const slug = provider?.type
  if (typeCatalog && slug) {
    const found = typeCatalog.find((t) => t.slug === slug)
    if (found) return found.label
  }
  return slug || 'Prestataire'
}

export function getProviderLabel(provider: any): string {
  if (!provider) return 'Prestataire'
  const business = provider.businessName || provider.business_name
  if (business) return business
  const user = provider.user
  if (user) {
    const name = [user.firstName || user.first_name, user.lastName || user.last_name]
      .filter(Boolean)
      .join(' ')
    if (name) return name
  }
  return 'Prestataire'
}
