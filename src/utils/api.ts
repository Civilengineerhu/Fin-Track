/// <reference types="vite/client" />

/**
 * API Configuration and Helper
 * Supports custom backend URL (via VITE_API_URL environment variable)
 * Defaults to relative '/api' for same-origin server deployment
 */
export const API_BASE_URL = (
  typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL
    ? (import.meta as any).env.VITE_API_URL
    : ''
).replace(/\/$/, '');

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

