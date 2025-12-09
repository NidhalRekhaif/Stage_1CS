export interface PublicationsByType {
  revue: number;
  conference: number;
}

export interface OpenAccess {
  open_access_count: number;
  unknown_open_access_count: number;
  ratio: number;
}

export interface Rankings {
  scimago_distribution: Record<string, number>;
  dgrsdt_distribution: Record<string, number>;
  core_distribution: Record<string, number>;
}

export interface Overview {
  total_publications: number;
  publications_by_type: PublicationsByType;
  open_access: OpenAccess;
  rankings: Rankings;
}

export interface Researchers {
  total: number;
  with_lab: number;
  without_lab: number;
}

export interface DashboardData {
  overview: Overview;
  researchers: Researchers;
}