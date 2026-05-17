/**
 * Statistics API Module
 * Handles all statistics-related API calls
 */

import apiClient from "./client";

export interface GlobalStatistics {
  total_publications: number;
  total_researchers: number;
  total_labs: number;
  [key: string]: any;
}

export interface PublicationStats {
  total_publications: number;
  by_year: Record<string, number>;
  by_type: Record<string, number>;
  [key: string]: any;
}

export interface ResearcherStats {
  total_researchers: number;
  by_lab: Record<string, number>;
  average_publications: number;
  [key: string]: any;
}

export interface LabStatistics {
  lab_id: number;
  lab_name: string;
  total_researchers: number;
  total_publications: number;
  [key: string]: any;
}

export interface RankingStats {
  [key: string]: any;
}

const ENDPOINT = "/statistics";

export const StatisticsApi = {
  /**
   * Get global statistics
   */
  async getGlobalStatistics(): Promise<GlobalStatistics> {
    return apiClient.get<GlobalStatistics>(`${ENDPOINT}/global`);
  },

  /**
   * Get publication statistics
   */
  async getPublicationStats(): Promise<PublicationStats> {
    return apiClient.get<PublicationStats>(`${ENDPOINT}/publications`);
  },

  /**
   * Get researcher statistics
   */
  async getResearcherStats(): Promise<ResearcherStats> {
    return apiClient.get<ResearcherStats>(`${ENDPOINT}/researchers`);
  },

  /**
   * Get statistics for a specific lab
   */
  async getLabStatistics(labId: number): Promise<LabStatistics> {
    return apiClient.get<LabStatistics>(`${ENDPOINT}/labs/${labId}`);
  },

  /**
   * Get ranking statistics
   */
  async getRankingStats(): Promise<RankingStats> {
    return apiClient.get<RankingStats>(`${ENDPOINT}/rankings`);
  },

  /**
   * Get statistics by researcher
   */
  async getResearcherPublicationStats(chercheurId: number): Promise<any> {
    return apiClient.get<any>(`${ENDPOINT}/researchers/${chercheurId}/publications`);
  },

  /**
   * Get statistics by year
   */
  async getStatisticsByYear(year: number): Promise<any> {
    return apiClient.get<any>(`${ENDPOINT}/yearly/${year}`);
  },
};

export default StatisticsApi;
