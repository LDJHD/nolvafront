const FIELD_LABELS: Record<string, string> = {
  email: "l'adresse email",
  phone: 'le numero de telephone',
  password: 'le mot de passe',
  first_name: 'le prenom',
  last_name: 'le nom',
  city: 'la ville',
  business_name: 'le nom commercial',
  type: 'le type de prestation',
}

const VINE_MESSAGES: Record<string, string> = {
  'vine.string.email': "L'adresse email n'est pas valide.",
  'vine.string.minLength': 'Ce champ est trop court.',
  'vine.string': 'Ce champ est invalide.',
}

const CLIENT_MESSAGES: Record<string, string> = {
  email: "Cette adresse email est deja utilisee. Connectez-vous ou utilisez une autre adresse.",
  phone: "Ce numero de telephone est deja associe a un compte.",
}

function cleanMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('duplicate') || lower.includes('er_dup_entry') || lower.includes('already exists')) {
    if (lower.includes('email')) return CLIENT_MESSAGES.email
    if (lower.includes('phone')) return CLIENT_MESSAGES.phone
    return 'Ces informations sont deja utilisees par un autre compte.'
  }
  if (lower.includes('network error') || lower.includes('failed to fetch')) {
    return "Impossible de joindre le serveur. Verifiez votre connexion puis reessayez."
  }
  return message
}

export function parseRegisterError(err: any): string {
  const data = err?.response?.data
  if (!data) {
    return cleanMessage(err?.message || "Erreur lors de l'inscription. Verifiez votre connexion et reessayez.")
  }

  if (data.field && CLIENT_MESSAGES[data.field]) {
    return CLIENT_MESSAGES[data.field]
  }

  if (data.message && typeof data.message === 'string') {
    return cleanMessage(data.message)
  }

  const errors = data.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0]
    const field = first?.field || first?.property
    const rule = first?.rule
    const label = field ? FIELD_LABELS[field] || field : 'un champ'
    if (field && CLIENT_MESSAGES[field]) {
      return CLIENT_MESSAGES[field]
    }
    if (rule && VINE_MESSAGES[`vine.${rule}`]) {
      return VINE_MESSAGES[`vine.${rule}`]
    }
    if (first?.message) {
      return cleanMessage(String(first.message))
    }
    return `Verifiez ${label}.`
  }

  return "Erreur lors de l'inscription."
}
