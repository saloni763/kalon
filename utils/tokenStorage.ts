import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@kalon_auth_token';
const USER_KEY = '@kalon_user_data';

/**
 * Save authentication token to AsyncStorage
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw new Error('Failed to save authentication token');
  }
};

/**
 * Get authentication token from AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove authentication token from AsyncStorage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

/**
 * Save user data to AsyncStorage
 */
export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Get user data from AsyncStorage
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has a valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    const hasToken = token !== null && token.length > 0;
    console.log('Auth check - has token:', hasToken);
    return hasToken;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Debug function to check stored data
 */
export const debugStorage = async (): Promise<void> => {
  try {
    const token = await getToken();
    const user = await getUser();
    console.log('=== Storage Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('User exists:', !!user);
    console.log('User data:', user ? JSON.stringify(user, null, 2) : 'null');
    console.log('===================');
  } catch (error) {
    console.error('Debug storage error:', error);
  }
};

