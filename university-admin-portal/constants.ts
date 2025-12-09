import { StatsData, PaginatedResponse, Researcher, Publication } from './types';

export const MOCK_STATS: StatsData = {
  overview: {
    total_publications: 200,
    publications_by_type: {
      'Revues': 101,
      'Conferences': 99
    },
    open_access: {
      'count': 59
    },
    rankings: {
      scimago_distribution: {
        'Q1': 50,
        'Q2': 40,
        'Q3': 30,
        'Q4': 10,
        'Unknown': 70
      },
      dgrsdt_distribution: {
        'A': 120,
        'B': 40,
        'C': 30,
        'Unknown': 10
      },
      core_distribution: {
        'A*': 25,
        'A': 55,
        'B': 35,
        'C': 20,
        'Unknown': 65
      }
    }
  },
  researchers: {
    total: 49,
    with_lab: 49,
    without_lab: 0
  }
};

export const MOCK_RESEARCHERS: PaginatedResponse<Researcher> = {
  total: 49,
  page: 1,
  limit: 10,
  data: [
    {
      id: 1,
      nom: "Reed",
      prenom: "Evelyn",
      email: "evelyn.reed@university.edu",
      grade: "Professor",
      dblp_url: "https://dblp.org/pid/...",
      i_10_index: 87,
      labo_id: 1,
      telephone: "+1 (555) 123-4567",
      google_scholar_url: "https://scholar.google.com/...",
      h_index: 31,
      avatar: "https://picsum.photos/200/200"
    },
    {
      id: 2,
      nom: "Carter",
      prenom: "Ben",
      email: "b.carter@university.edu",
      grade: "Associate Professor",
      i_10_index: 45,
      labo_id: 1,
      h_index: 22,
      avatar: "https://picsum.photos/201/201"
    },
    {
      id: 3,
      nom: "Sharma",
      prenom: "Anya",
      email: "a.sharma@university.edu",
      grade: "Professor",
      i_10_index: 92,
      labo_id: 2,
      h_index: 40,
      avatar: "https://picsum.photos/202/202"
    },
    {
      id: 4,
      nom: "Kim",
      prenom: "Leo",
      email: "l.kim@university.edu",
      grade: "Assistant Professor",
      i_10_index: 15,
      labo_id: 1,
      h_index: 12,
      avatar: "https://picsum.photos/203/203"
    },
    {
      id: 5,
      nom: "Chen",
      prenom: "Olivia",
      email: "o.chen@university.edu",
      grade: "Professor",
      i_10_index: 60,
      labo_id: 3,
      h_index: 28,
      avatar: "https://picsum.photos/204/204"
    },
     {
      id: 6,
      nom: "ZEGOUR",
      prenom: "DJAMEL EDDINE",
      email: "d_zegour@esi.dz",
      grade: "Professeur",
      dblp_url: "https://dblp.org/pid/53/5403",
      i_10_index: 10,
      labo_id: 1,
      telephone: null,
      google_scholar_url: null,
      h_index: 5,
      avatar: "https://picsum.photos/205/205"
    }
  ]
};

export const MOCK_PUBLICATIONS: PaginatedResponse<Publication> = {
  total: 101,
  page: 1,
  limit: 10,
  data: [
    {
      id: 1,
      titre: "The Impact of AI on Modern Genetics",
      annee_publication: 2023,
      citations: 142,
      abstract: "This paper explores the transformative effects of artificial intelligence on traditional research methodologies across various scientific disciplines. We analyze case studies where AI-driven data analysis has led to significant breakthroughs.",
      doi: "10.1007/s11042-023-01742-8",
      url: "https://example.com/publication/12345",
      is_open_access: true,
      revue_id: 1,
      authors: ["Dr. Evelyn Reed", "Dr. Ben Carter"],
      journal: "International Conference on AI",
      type: "Conference"
    },
    {
      id: 2,
      titre: "Partitioned Trees: A New Approach",
      annee_publication: 2025,
      citations: 576,
      abstract: "This paper discusses the interest of binary partition trees as a region-oriented image representation. Binary partition trees concentrate in a compact and structured representation a set of meaningful regions that can be extracted from an image.",
      doi: null,
      url: "https://cys.cic.ipn.mx/ojs/index.php/CyS/article/view/4820",
      is_open_access: false,
      revue_id: 1,
      authors: ["Djamel Zegour", "Someone Else"],
      journal: "Computer Vision Journal",
      type: "Journal"
    },
    {
      id: 3,
      titre: "Deep Learning for Medical Imaging: A Comprehensive Review",
      annee_publication: 2023,
      citations: 1204,
      abstract: "This review provides a comprehensive overview of the application of deep learning techniques in medical imaging. We explore the foundational concepts of neural networks, convolutional neural networks (CNNs), and other advanced architectures.",
      doi: "10.1109/TMI.2023.123456",
      url: "https://ieeexplore.ieee.org/document/9876543",
      is_open_access: true,
      revue_id: 2,
      authors: ["Dr. Jane Doe", "Dr. John Smith"],
      journal: "IEEE Transactions on Medical Imaging",
      type: "Journal"
    },
    {
      id: 4,
      titre: "Advanced Research in Quantum Computing",
      annee_publication: 2023,
      citations: 89,
      abstract: "A deep dive into qubits and error correction.",
      doi: "10.1000/xyz123",
      url: "https://example.com",
      is_open_access: true,
      revue_id: 3,
      journal: "Nature Physics",
      type: "Journal"
    },
    {
      id: 5,
      titre: "Cellular Automata in Biological Modeling",
      annee_publication: 2023,
      citations: 12,
      abstract: "Modelling growth with CA.",
      doi: "10.1000/xyz789",
      url: "https://example.com",
      is_open_access: false,
      revue_id: 4,
      journal: "BioSystems",
      type: "Journal"
    }
  ]
};
