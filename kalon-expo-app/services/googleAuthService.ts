import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

// Use platform-specific client ID
const getClientId = () => {
  if (Platform.OS === 'ios' && GOOGLE_IOS_CLIENT_ID) {
    return GOOGLE_IOS_CLIENT_ID;
  }
  if (Platform.OS === 'android' && GOOGLE_ANDROID_CLIENT_ID) {
    return GOOGLE_ANDROID_CLIENT_ID;
  }
  return GOOGLE_CLIENT_ID;
};

/**
 * Initiate Google OAuth login
 * Returns the access token and user info
 */
export const signInWithGoogle = async (): Promise<{
  accessToken: string;
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}> => {
  try {
    const clientId = getClientId();
    
    if (!clientId) {
      throw new Error('Google Client ID is not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
    }

    // Generate a random state for security
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );

    // Determine if we're in development (Expo Go) or production
    // In development, use proxy for redirect URI
    const useProxy = Constants.appOwnership === 'expo';
    
    // Create redirect URI
    // For Expo Go, the proxy URL is automatically used
    // For standalone apps, use the custom scheme
    const redirectUri = useProxy
      ? AuthSession.makeRedirectUri()
      : AuthSession.makeRedirectUri({
          scheme: 'kalonexpoapp',
          path: 'auth',
        });

    console.log('Google OAuth - Client ID:', clientId.substring(0, 20) + '...');
    console.log('Google OAuth - Redirect URI:', redirectUri);
    console.log('Google OAuth - Using Proxy:', useProxy);

    // Create the auth request
    // Using IdToken response type to get the ID token directly
    // This is the recommended approach for mobile apps
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: redirectUri,
      state,
      extraParams: {},
    });

    // Get the discovery document
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Prompt for authentication
    const result = await request.promptAsync(discovery, {
      showInRecents: true,
    });

    if (result.type === 'success') {
      const idToken = result.params.id_token;

      if (!idToken) {
        throw new Error('No ID token received from Google. Please check your Google OAuth configuration.');
      }

      // Decode the ID token to get user info
      const userInfo = decodeJWT(idToken);

      // Validate required fields
      if (!userInfo.sub || !userInfo.email || !userInfo.name) {
        throw new Error('Invalid ID token: missing required user information');
      }

      return {
        accessToken: '', // Not needed for our use case
        idToken: idToken,
        user: {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      };
    } else if (result.type === 'error') {
      const error = result.error as any;
      const errorMessage = error?.message || error?.error_description || error?.error || 'Google sign-in failed';
      console.error('Google OAuth error:', result.error);
      
      // Provide specific error messages for common issues
      if (errorMessage.includes('access_denied') || errorMessage.includes('access blocked')) {
        throw new Error('Access denied. Please ensure:\n1. The redirect URI is configured in Google Cloud Console\n2. The OAuth consent screen is published\n3. Your app is authorized in Google Workspace (if applicable)\n\nRedirect URI should be: ' + redirectUri);
      }
      
      if (errorMessage.includes('redirect_uri_mismatch')) {
        throw new Error(`Redirect URI mismatch. Please add this redirect URI to your Google Cloud Console:\n${redirectUri}`);
      }
      
      throw new Error(`Google sign-in failed: ${errorMessage}`);
    } else if (result.type === 'dismiss') {
      throw new Error('Google sign-in was cancelled');
    } else {
      throw new Error('Google sign-in was cancelled or failed');
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('access_denied') || error.message?.includes('access blocked')) {
      throw new Error('Access denied. Please check your Google OAuth configuration in Google Cloud Console. Ensure the redirect URI is properly configured.');
    }
    
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Decode JWT token without verification (for extracting user info)
 * In production, you should verify the token signature
 */
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Failed to decode ID token');
  }
};

