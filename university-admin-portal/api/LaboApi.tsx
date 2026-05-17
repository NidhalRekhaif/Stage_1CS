/**
 * Labo (Laboratory) API Module
 * Handles all laboratory-related API calls
 */

import apiClient, { PaginatedResponse } from "./client";

export interface Labo {
  id: number;
  nom: string;
  [key: string]: any;
}

export interface LaboBase {
  nom: string;
  [key: string]: any;
}

export interface LaboCreate extends LaboBase {}

export interface LaboUpdate {
  nom?: string;
  [key: string]: any;
}

export interface LaboFilters {
  page?: number;
  limit?: number;
  labo_name?: string;
}

const ENDPOINT = "/chercheurs/labos";

export const LaboApi = {
  /**
   * Get all laboratories with optional pagination and search
   */
  async getAll(filters?: LaboFilters): Promise<PaginatedResponse<Labo> | Labo[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.labo_name) params.append("labo_name", filters.labo_name);
    }

    const queryString = params.toString();
    const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

    return apiClient.get<PaginatedResponse<Labo> | Labo[]>(url);
  },

  /**
   * Get laboratory by name
   */
  async getByName(name: string): Promise<Labo[]> {
    const params = new URLSearchParams({ labo_name: name });
    return apiClient.get<Labo[]>(`${ENDPOINT}?${params.toString()}`);
  },

  /**
   * Create a new laboratory
   */
  async create(data: LaboCreate): Promise<{ message: string }> {
    return apiClient.post(`${ENDPOINT}`, data);
  },

  /**
   * Update laboratory
   */
  async update(id: number, data: LaboUpdate): Promise<Labo> {
    return apiClient.patch<Labo>(`${ENDPOINT}${id}`, data);
  },

  /**
   * Delete laboratory
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}${id}`);
  },
};

export default LaboApi;
