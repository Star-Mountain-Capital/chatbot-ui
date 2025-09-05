import { z } from 'zod';

// Define schema for required environment variables
const configSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
  VITE_ALLOWED_IFRAME_DOMAIN: z.string().url(),
  VITE_ENV: z.enum(['dev', 'production']).optional().default('production'),
  VITE_DEV_USER_ID: z.string().optional()
});

// Gather env vars from import.meta.env
const rawConfig = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_ALLOWED_IFRAME_DOMAIN: import.meta.env.VITE_ALLOWED_IFRAME_DOMAIN,
  VITE_ENV: import.meta.env.VITE_ENV || undefined // Let schema default to 'production' if not set
};

// Validate config
const parsed = configSchema.safeParse(rawConfig);
if (!parsed.success) {
  // You can customize this error handling as needed
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = parsed.data;
