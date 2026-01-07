import Toast from 'react-native-toast-message';

/**
 * Toast notification utility
 * Provides a cleaner alternative to Alert.alert()
 */

export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  /**
   * Show link copied toast
   */
  linkCopied: () => {
    Toast.show({
      type: 'linkCopied',
      text1: 'Link copied to clipboard',
      position: 'bottom',
      visibilityTime: 2000,
    });
  },

  /**
   * Show saved toast with See All option
   */
  saved: (onSeeAll?: () => void) => {
    Toast.show({
      type: 'saved',
      text1: 'Saved',
      position: 'bottom',
      visibilityTime: 3000,
      props: {
        onSeeAll: onSeeAll || (() => {}),
      },
    });
  },

  /**
   * Show notify toast with Manage option
   */
  notify: (userName: string, onManage?: () => void) => {
    Toast.show({
      type: 'notify',
      text1: `You'll be notified when ${userName} posts`,
      position: 'bottom',
      visibilityTime: 4000,
      props: {
        onManage: onManage || (() => {}),
      },
    });
  },
};

