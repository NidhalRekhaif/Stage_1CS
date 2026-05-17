/**
 * Conference API Module
 * Handles all conference-related API calls
 */

import apiClient, { PaginatedResponse } from "./client";

export interface Conference {
  id: number;
  nom: string;
  [key: string]: any;
}

export interface ConferenceBase {
  nom: string;
  [key: string]: any;
}

export interface ConferenceCreate extends ConferenceBase {}

export interface ConferenceUpdate {
  nom?: string;
  [key: string]: any;
}

export interface ConferenceRanking {
  conference_id: number;
  annee: number;
  [key: string]: any;
}

export interface ConferenceRankingCreate {
  conference_id: number;
  annee: number;
  [key: string]: any;
}

export interface ConferenceRankingUpdate {
  [key: string]: any;
}

const ENDPOINT = "/conference";

export const ConferenceApi = {
  /**
   * Get all conferences
   */
  async getAll(): Promise<Conference[]> {
    return apiClient.get<Conference[]>(ENDPOINT);
  },

  /**
   * Get conference by ID
   */
  async getById(id: number): Promise<Conference> {
    return apiClient.get<Conference>(`${ENDPOINT}/${id}`);
  },

  /**
   * Create a new conference
   */
  async create(data: ConferenceCreate): Promise<Conference> {
    return apiClient.post<Conference>(`${ENDPOINT}/`, data);
  },

  /**
   * Update conference
   */
  async update(id: number, data: ConferenceUpdate): Promise<Conference> {
    return apiClient.patch<Conference>(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Delete conference
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Add conference ranking
   */
  async addRanking(data: ConferenceRankingCreate): Promise<ConferenceRanking> {
    return apiClient.post<ConferenceRanking>(`${ENDPOINT}/ranking`, data);
  },

  /**
   * Update conference ranking
   */
  async updateRanking(
    conferenceId: number,
    annee: number,
    data: ConferenceRankingUpdate
  ): Promise<ConferenceRanking> {
    return apiClient.patch<ConferenceRanking>(`${ENDPOINT}/ranking/${conferenceId}/${annee}`, data);
  },

  /**
   * Delete conference ranking
   */
  async deleteRanking(conferenceId: number, annee: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/ranking/${conferenceId}/${annee}`);
  },
};

export default ConferenceApi;
