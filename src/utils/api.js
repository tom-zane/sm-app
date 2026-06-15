import { getData, saveData } from './storage';

// Your new modernized worker deployment URL
const API_BASE_URL = 'https://jpdcl-meter-api.aryanue195035ece.workers.dev';
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const fetchMeterData = async (accountNumber, forceRefresh = false) => {
  if (!accountNumber) throw new Error("Account number is required.");

  const cacheKey = `data-${accountNumber}`;
  const cacheTimeKey = `data-${accountNumber}-timestamp`;

  try {
    // 1. Check Cache (unless forced to refresh)
    if (!forceRefresh) {
      const cachedData = await getData(cacheKey);
      const cachedTimestamp = await getData(cacheTimeKey);

      if (cachedData && cachedTimestamp) {
        const isCacheValid = (Date.now() - parseInt(cachedTimestamp, 10)) < CACHE_DURATION;
        if (isCacheValid) {
          console.log("[API] Returning cached data for", accountNumber);
          return cachedData;
        }
      }
    }

    // 2. Fetch Fresh Data from the new /getcustomerinfo route
    console.log("[API] Fetching fresh data for", accountNumber);
    const response = await fetch(`${API_BASE_URL}/getcustomerinfo?consumerCode=${accountNumber}`);
    
    // Parse the JSON immediately so we can inspect its contents even on non-200 statuses
    const data = await response.json();
    
    if (!response.ok) {
      // Pulls the explicit error message parsed by the worker (e.g., "Your CustomerID is Wrong...")
      throw new Error(data.error || "Failed to fetch data from the server.");
    }
    
    // 3. Update Cache
    await saveData(cacheKey, data);
    await saveData(cacheTimeKey, Date.now().toString());

    return data;
  } catch (error) {
    console.error("[API Error]:", error);
    throw error;
  }
};