import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  ACCOUNTS: '@sm_accounts',
  SELECTED_ACCOUNT: '@sm_selected_account',
};

export const saveData = async (key, value) => {
  if (!key) return;
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data', e);
  }
};

export const getData = async (key) => {
  if (!key) return null;
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading data', e);
    return null;
  }
};

// NEW: Safely wipe only the API cache, preserving accounts & themes
export const clearApiCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('data-'));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
    return true;
  } catch (e) {
    console.error('Error clearing cache', e);
    return false;
  }
};