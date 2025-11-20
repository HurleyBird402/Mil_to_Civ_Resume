// lib/redis.ts
import { Redis } from '@upstash/redis';

// We check for the "KV_" names first (which you have), 
// and fall back to "UPSTASH_" names just in case.
const getUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const getToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

// Create the Connection
export const redis = new Redis({
  url: getUrl(),
  token: getToken(),
});

// Helper to check if we are "online"
export const isRedisConfigured = () => {
    // Check if both the URL and Token exist and are not empty
    const url = getUrl();
    const token = getToken();
    return (url.length > 0 && token.length > 0);
}