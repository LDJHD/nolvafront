import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'

export interface Produit {
  id: number
  nom: string
  image?: string | null
  prix: number
  date_expiration: string
  description: string
  nom_categorie: string
  nom_famille: string
  composition: string
  created_at?: string
  updated_at?: string
}

export interface ProduitPayload {
  valeur: string
  image?: File | null
}

/**
 * Récupère tous les types de comptes
 */
export const getAllproduit = async (): Promise<Produit[]> => {
  const res = await axios.get<Produit[]>(API_URL+'/produits')
  return res.data
}

/**
 * Récupère un type de compte par son ID
 */
export const getproduitById = async (id: number): Promise<Produit> => {
  const res = await axios.get<Produit>(`${API_URL}/produits/${id}`)
  return res.data
}

export const searchProduit = async (valeur: string): Promise<Produit[]> => {
  const res = await axios.post<Produit[]>(`${API_URL}/produits/search`, { valeur })
  return res.data
}

/**
 * Crée un type de compte
 */

/**
 * Met à jour un type de compte

/**
 * Supprime un type de compte
 */

