/**
 * Revue (Journal) API Module
 * Handles all journal-related API calls
 */

import apiClient, { PaginatedResponse } from "./client";

export interface Revue {
  id: number;
  nom: string;
  issn?: string;
  [key: string]: any;
}

export interface RevueBase {
  nom: string;
  issn?: string;
  [key: string]: any;
}

export interface RevueCreate extends RevueBase {}

export interface RevueUpdate {
  nom?: string;
  issn?: string;
  [key: string]: any;
}

export interface RevueRanking {
  revue_id: number;
  annee: number;
  [key: string]: any;
}

export interface RevueRankingCreate {
  revue_id: number;
  annee: number;
  [key: string]: any;
}

export interface RevueRankingUpdate {
  [key: string]: any;
}

const ENDPOINT = "/revue";

export const RevueApi = {
  /**
   * Get all journals
   */
  async getAll(): Promise<Revue[]> {
    return apiClient.get<Revue[]>(ENDPOINT);
  },

  /**
   * Get journal by ID
   */
  async getById(id: number): Promise<Revue> {
    return apiClient.get<Revue>(`${ENDPOINT}/${id}`);
  },

  /**
   * Create a new journal
   */
  async create(data: RevueCreate): Promise<Revue> {
    return apiClient.post<Revue>(`${ENDPOINT}/`, data);
  },

  /**
   * Update journal
   */
  async update(id: number, data: RevueUpdate): Promise<Revue> {
    return apiClient.patch<Revue>(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Delete journal
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Add journal ranking
   */
  async addRanking(data: RevueRankingCreate): Promise<RevueRanking> {
    return apiClient.post<RevueRanking>(`${ENDPOINT}/ranking`, data);
  },

  /**
   * Update journal ranking
   */
  async updateRanking(
    revueId: number,
    annee: number,
    data: RevueRankingUpdate
  ): Promise<RevueRanking> {
    return apiClient.patch<RevueRanking>(`${ENDPOINT}/ranking/${revueId}/${annee}`, data);
  },

  /**
   * Delete journal ranking
   */
  async deleteRanking(revueId: number, annee: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/ranking/${revueId}/${annee}`);
  },
};

export default RevueApi;
