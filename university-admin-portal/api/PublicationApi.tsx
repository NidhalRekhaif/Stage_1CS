/**
 * Publication API Module
 * Handles all publication-related API calls
 */

import apiClient, { PaginatedResponse } from "./client";

export interface Publication {
  id: number;
  titre: string;
  annee: number;
  [key: string]: any;
}

export interface PublicationCreate {
  titre: string;
  annee: number;
  [key: string]: any;
}

export interface PublicationUpdate {
  titre?: string;
  annee?: number;
  [key: string]: any;
}

export interface PublicationRevue extends Publication {
  revue_id: number;
}

export interface PublicationRevueCreate extends PublicationCreate {
  revue_id: number;
}

export interface PublicationRevueUpdate extends PublicationUpdate {
  revue_id?: number;
}

export interface PublicationConference extends Publication {
  conference_id: number;
}

export interface PublicationConferenceCreate extends PublicationCreate {
  conference_id: number;
}

export interface PublicationConferenceUpdate extends PublicationUpdate {
  conference_id?: number;
}

export interface LienChercheurPublication {
  chercheur_id: number;
  publication_id: number;
  [key: string]: any;
}

export interface LienCreate {
  chercheur_id: number;
  publication_id: number;
  [key: string]: any;
}

export interface LienUpdate {
  [key: string]: any;
}

const ENDPOINT = "/publications";

export const PublicationApi = {
  /**
   * Get all publications with optional pagination
   */
  async getAll(limit: number = 100, page: number = 1): Promise<Publication[] | PaginatedResponse<Publication>> {
    return apiClient.get<Publication[] | PaginatedResponse<Publication>>(`${ENDPOINT}?limit=${limit}&page=${page}`);
  },

  /**
   * Get publication by ID
   */
  async getById(id: number): Promise<Publication> {
    return apiClient.get<Publication>(`${ENDPOINT}/${id}`);
  },

  /**
   * Create a new publication
   */
  async create(data: PublicationCreate & { chercheur_id?: number }): Promise<Publication> {
    // Determine which endpoint to use based on the publication type
    const endpoint = (data as any).revue_id ? `${ENDPOINT}/revue` : `${ENDPOINT}/conference`;
    const chercheurId = (data as any).chercheur_id;
    const url = typeof chercheurId === 'number' ? `${endpoint}?chercheur_id=${chercheurId}` : endpoint;
    const payload = { ...data };
    delete (payload as any).chercheur_id;
    return apiClient.post<Publication>(url, payload);
  },

  /**
   * Update publication
   */
  async update(id: number, data: PublicationUpdate): Promise<Publication> {
    // Determine which endpoint to use based on the publication type
    const endpoint = (data as any).revue_id ? `${ENDPOINT}/revue` : `${ENDPOINT}/conference`;
    return apiClient.patch<Publication>(`${endpoint}/${id}`, data);
  },

  /**
   * Delete publication
   */
  async delete(id: number): Promise<void> {
    // Try to delete from revue first, if fails try conference
    try {
      return apiClient.delete(`${ENDPOINT}/revue/${id}`);
    } catch {
      return apiClient.delete(`${ENDPOINT}/conference/${id}`);
    }
  },

  /**
   * Add researcher to publication
   */
  async addResearcherLink(data: LienCreate): Promise<LienChercheurPublication> {
    return apiClient.post<LienChercheurPublication>(`${ENDPOINT}/liens`, data);
  },

  /**
   * Remove researcher from publication
   */
  async removeResearcherLink(chercheurId: number, publicationId: number): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/liens/${chercheurId}/${publicationId}`);
  },

  /**
   * Update researcher publication link
   */
  async updateResearcherLink(
    chercheurId: number,
    publicationId: number,
    data: LienUpdate
  ): Promise<LienChercheurPublication> {
    return apiClient.patch<LienChercheurPublication>(
      `${ENDPOINT}/liens/${chercheurId}/${publicationId}`,
      data
    );
  },
};

export default PublicationApi;
