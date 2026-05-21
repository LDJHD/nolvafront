const FIELD_LABELS: Record<string, string> = {
  email: "l'adresse email",
  phone: 'le numéro de téléphone',
  password: 'le mot de passe',
  first_name: 'le prénom',
  last_name: 'le nom',
}

const VINE_MESSAGES: Record<string, string> = {
  'vine.string.email': "L'adresse email n'est pas valide.",
  'vine.string.minLength': 'Ce champ est trop court.',
  'vine.string': 'Ce champ est invalide.',
}

export function parseRegisterError(err: any): string {
  const data = err?.response?.data
  if (!data) {
    return err?.message || "Erreur lors de l'inscription. Vérifiez votre connexion et réessayez."
  }

  if (data.message && typeof data.message === 'string') {
    return data.message
  }

  const errors = data.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0]
    const field = first?.field || first?.property
    const rule = first?.rule
    const label = field ? FIELD_LABELS[field] || field : 'un champ'
    if (rule && VINE_MESSAGES[`vine.${rule}`]) {
      return VINE_MESSAGES[`vine.${rule}`]
    }
    if (first?.message) {
      return String(first.message)
    }
    return `Vérifiez ${label}.`
  }

  return "Erreur lors de l'inscription."
}
