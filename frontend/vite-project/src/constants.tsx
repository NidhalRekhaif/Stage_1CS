import type { DashboardData } from './types';

export const MOCK_DATA: DashboardData = {
  "overview": {
    "total_publications": 200,
    "publications_by_type": {
      "revue": 101,
      "conference": 99
    },
    "open_access": {
      "open_access_count": 59,
      "unknown_open_access_count": 0,
      "ratio": 0.29
    },
    "rankings": {
      "scimago_distribution": {
        "Unknown": 30,
        "Q1": 24,
        "Q2": 19,
        "Q3": 20,
        "Q4": 8
      },
      "dgrsdt_distribution": {
        "Unknown": 64,
        "A": 27,
        "B": 10
      },
      "core_distribution": {
        "Unknown": 96,
        "B": 2,
        "C": 1
      }
    }
  },
  "researchers": {
    "total": 49,
    "with_lab": 49,
    "without_lab": 0
  }
};

// Colors extracted from the design
export const COLORS = {
  background: '#0F111A',
  cardBg: '#151A23', // Slightly lighter dark for cards
  primary: '#3B82F6', // Blue
  purple: '#6366F1', // Indigo/Purple
  pink: '#EC4899',
  green: '#10B981',
  orange: '#F97316',
  gray: '#64748B',
  darkGray: '#334155',
  barTrack: '#1E293B',
};

// Mapping labels to specific colors for the charts
export const RANKING_COLORS: Record<string, string> = {
  'Q1': 'bg-indigo-500',
  'Q2': 'bg-pink-500',
  'Q3': 'bg-emerald-500',
  'Q4': 'bg-orange-600',
  'A': 'bg-indigo-600',
  'B': 'bg-emerald-700', // Adjusted for differentiation
  'C': 'bg-orange-700',
  'Unknown': 'bg-slate-500',
  'A*': 'bg-indigo-400',
};