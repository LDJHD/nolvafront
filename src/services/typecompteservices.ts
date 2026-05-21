import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'

export interface TypeCompte {
  id: number
  libelle: string
  nom: string
  image?: string | null
  prix: number
  duree: string
  statut: string
  nombreEcran: number
  plateforme: string
  prix_ancien: number
  description: string
  caracteristiques: string
  composition: string
  created_at?: string
  updated_at?: string
}

export interface TypeComptePayload {
  libelle: string
  image?: File | null
}

/**
 * Récupère tous les types de comptes
 */
export const getAllTypesComptes = async (): Promise<TypeCompte[]> => {
  const res = await axios.get<TypeCompte[]>(API_URL+'/type_comptes')
  return res.data
}

/**
 * Récupère un type de compte par son ID
 */
export const getTypeCompteById = async (id: number): Promise<TypeCompte> => {
  const res = await axios.get<TypeCompte>(`${API_URL}/${id}`)
  return res.data
}

/**
 * Crée un type de compte
 */
export const createTypeCompte = async (data: TypeComptePayload): Promise<TypeCompte> => {
  const formData = new FormData()
  formData.append('libelle', data.libelle)
  if (data.image) {
    formData.append('image', data.image)
  }

  const res = await axios.post<TypeCompte>(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data
}

/**
 * Met à jour un type de compte
 */
export const updateTypeCompte = async (
  id: number,
  data: TypeComptePayload
): Promise<TypeCompte> => {
  const formData = new FormData()
  formData.append('libelle', data.libelle)
  if (data.image) {
    formData.append('image', data.image)
  }

  const res = await axios.put<TypeCompte>(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data
}

/**
 * Supprime un type de compte
 */
export const deleteTypeCompte = async (id: number): Promise<{ message: string }> => {
  const res = await axios.delete<{ message: string }>(`${API_URL}/${id}`)
  return res.data
}
