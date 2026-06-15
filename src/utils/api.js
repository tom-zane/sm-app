import { getData, saveData } from './storage';

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
          return cachedData;
        }
      }
    }

    // 2. Fetch fresh profile details
    const response = await fetch(`${API_BASE_URL}/getcustomerinfo?consumerCode=${accountNumber}`);
    const responseText = await response.text();

    let data;
    try {
      // FIXED: Removed the stray 'j' character
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[API] JSON parse error:", parseError);
      throw new Error("Failed to process the server response format.");
    }
    
    if (!response.ok) {
      console.error("[API] Response not ok, error:", data.error);
      throw new Error(data.error || "Failed to fetch data from the server.");
    }
    
    // 3. Update Cache
    await saveData(cacheKey, data);
    await saveData(cacheTimeKey, Date.now().toString());

    return data;
  } catch (error) {
    console.error("[API Error]:", error.message);
    throw error;
  }
};