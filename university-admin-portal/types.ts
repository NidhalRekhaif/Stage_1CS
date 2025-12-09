export interface StatsOverview {
    total_publications: number;
    publications_by_type: Record<string, number>;
    open_access: Record<string, number>;
    rankings: {
      scimago_distribution: Record<string, number>;
      dgrsdt_distribution: Record<string, number>;
      core_distribution: Record<string, number>;
    };
  }
  
  export interface StatsData {
    overview: StatsOverview;
    researchers: {
      total: number;
      with_lab: number;
      without_lab: number;
    };
  }
  
  export interface Researcher {
    id: number;
    nom: string; // Last Name
    prenom: string; // First Name
    email: string;
    grade: string;
    dblp_url?: string;
    google_scholar_url?: string;
    telephone?: string;
    h_index: number;
    i_10_index: number;
    labo_id: number;
    avatar?: string; // Optional for UI
  }
  
  export interface Publication {
    id: number;
    titre: string;
    annee_publication: number;
    citations: number;
    abstract: string;
    doi: string | null;
    url: string;
    is_open_access: boolean;
    revue_id: number;
    authors?: string[]; // Mocking authors for UI
    journal?: string; // Mocking journal name
    type?: 'Journal' | 'Conference';
  }
  
  export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    data: T[];
  }
  
  // UI Specific Types
  export type RankingCategory = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'A' | 'B' | 'C' | 'A*' | 'Unknown';
  