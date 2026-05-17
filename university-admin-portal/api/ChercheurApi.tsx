/**
 * Chercheur (Researcher) API Module
 * Handles all researcher-related API calls
 */

import apiClient, { PaginatedResponse } from "./client";

export interface Chercheur {
  id: number;
  nom: string;
  prenom: string;
  labo_id?: number | null;
  [key: string]: any;
}

export interface ChercheurCreate {
  nom: string;
  prenom: string;
  labo_id?: number | null;
  [key: string]: any;
}

export interface ChercheurUpdate {
  nom?: string;
  prenom?: string;
  labo_id?: number | null;
  [key: string]: any;
}

export interface ChercheurFilters {
  nom?: string;
  prenom?: string;
  labo_id?: number | null;
  page?: number;
  limit?: number;
}

const ENDPOINT = "/chercheurs";

export const ChercheurApi = {
  /**
   * Get all researchers with optional filters and pagination
   */
  async getAll(filters?: ChercheurFilters): Promise<PaginatedResponse<Chercheur>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.nom) params.append("nom", filters.nom);
      if (filters.prenom) params.append("prenom", filters.prenom);
      if (filters.labo_id != null) params.append("labo_id", filters.labo_id.toString());
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${ENDPOINT}/?${queryString}` : `${ENDPOINT}/`;

    return apiClient.get<PaginatedResponse<Chercheur>>(url);
  },

  /**
   * Get researcher by ID
   */
  async getById(id: number): Promise<Chercheur> {
    return apiClient.get<Chercheur>(`${ENDPOINT}/${id}`);
  },

  /**
   * Create a new researcher
   */
  async create(data: ChercheurCreate): Promise<Chercheur> {
    return apiClient.post<Chercheur>(`${ENDPOINT}/`, data);
  },

  /**
   * Update researcher
   */
  async update(id: number, data: ChercheurUpdate): Promise<Chercheur> {
    return apiClient.patch<Chercheur>(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Delete researcher
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

export default ChercheurApi;
