export const SECURITY_CONFIG = {
  // The only domain allowed to embed this app in an iframe
  ALLOWED_IFRAME_DOMAIN: import.meta.env.VITE_ALLOWED_IFRAME_DOMAIN || "https://retool.starmountaincapital.com",
} as const;

// Helper function to check if a domain is allowed
export function isAllowedDomain(domain: string): boolean {
  // Normalize domain (remove trailing slash)
  const normalizedDomain = domain.replace(/\/$/, '');
  // Allow any subdomain of starmountaincapital.com (including the main domain)
  return /^https?:\/\/[a-zA-Z0-9.-]*starmountaincapital\.com$/.test(normalizedDomain);
}

// Helper function to check if we're in development mode
export function isDevelopmentMode(): boolean {
  return import.meta.env.VITE_ENV === 'dev';
}

// Helper function to get and validate userId from URL
export function getUserIdFromUrl(): string | null {
  // If in development mode, return null (no validation required)
  if (isDevelopmentMode()) {
    return null;
  }

  // Get userId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  // If not in dev mode and userId is not provided, throw an error
  if (!userId) {
    throw new Error('userId parameter is required in production mode');
  }

  return userId;
} 