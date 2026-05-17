/**
 * API Client Configuration
 * Establishes base connection between frontend and backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  detail?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
}

/**
 * Base API client for making requests
 */
export const apiClient = {
  baseURL: API_BASE_URL,

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      ...config,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      const errorMsg = typeof error.detail === 'string' 
        ? error.detail 
        : typeof error.detail === 'object' && Array.isArray(error.detail)
        ? error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        : error.message 
        || "API Error";
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  },

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, config?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      const errorMsg = typeof error.detail === 'string' 
        ? error.detail 
        : typeof error.detail === 'object' && Array.isArray(error.detail)
        ? error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        : error.message 
        || "API Error";
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  },

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, config?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      const errorMsg = typeof error.detail === 'string' 
        ? error.detail 
        : typeof error.detail === 'object' && Array.isArray(error.detail)
        ? error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        : error.message 
        || "API Error";
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: RequestInit): Promise<T | void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      ...config,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json().catch(() => ({}));
      const errorMsg = typeof error.detail === 'string' 
        ? error.detail 
        : typeof error.detail === 'object' && Array.isArray(error.detail)
        ? error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        : error.message 
        || "API Error";
      throw new Error(errorMsg);
    }

    // Some DELETE endpoints don't return content
    if (response.status === 204) {
      return;
    }

    return response.json() as Promise<T>;
  },
};

export default apiClient;
