import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BackArrowIcon from '@/components/BackArrowIcon';
import { validatePassword } from '@/utils/validation';
import { useResetPassword } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';

const { width, height } = Dimensions.get('window');

export default function CreateNewPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // TanStack Query mutation for reset password
  const resetPasswordMutation = useResetPassword();

  // Handle new password change
  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (text.length > 0) {
      const result = validatePassword(text);
      setNewPasswordError(result.error || '');
      
      // Also validate confirm password if it has a value
      if (confirmPassword.length > 0) {
        if (text !== confirmPassword) {
          setConfirmPasswordError('Passwords do not match');
        } else {
          setConfirmPasswordError('');
        }
      }
    } else {
      setNewPasswordError('');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text.length > 0) {
      if (text !== newPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = () => {
    // Validate both passwords
    const newPasswordResult = validatePassword(newPassword);
    setNewPasswordError(newPasswordResult.error || '');
    
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
    }
    
    // If both validations pass, proceed
    if (newPasswordResult.isValid && newPassword === confirmPassword) {
      if (!params.email || !params.otp) {
        showToast.error('Missing required information. Please start the password reset process again.');
        router.push('/auth/forgot-password');
        return;
      }

      // Reset password using TanStack Query
      resetPasswordMutation.mutate(
        {
          emailOrPhone: params.email,
          otp: params.otp,
          newPassword: newPassword,
        },
        {
          onSuccess: () => {
            showToast.success(
              'Your password has been reset successfully. You can now login with your new password.'
            );
            // Navigate to login after a short delay
            setTimeout(() => {
              router.push('/auth/login');
            }, 1500);
          },
          onError: (error: any) => {
            showToast.error(
              error.message || 'Failed to reset password. Please try again.'
            );
          },
        }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <BackArrowIcon width={30} height={30} color="#000000" />
        </TouchableOpacity>

        {/* Create New Password Heading */}
        <Text style={styles.heading}>Create New Password</Text>
        
        {/* Instructional Text */}
        <Text style={styles.instructionText}>
          Create your new password. If you forget it, then you have to do forgot password.
        </Text>

        {/* New Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={[
            styles.inputContainer,
            newPasswordError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999999"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              onBlur={() => {
                const result = validatePassword(newPassword);
                setNewPasswordError(result.error || '');
              }}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIconContainer}
            >
              <Ionicons 
                name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
          {newPasswordError ? (
            <Text style={styles.errorText}>{newPasswordError}</Text>
          ) : null}
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <View style={[
            styles.inputContainer,
            confirmPasswordError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={() => {
                if (confirmPassword !== newPassword) {
                  setConfirmPasswordError('Passwords do not match');
                } else {
                  setConfirmPasswordError('');
                }
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIconContainer}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity 
          style={[styles.resetButton, resetPasswordMutation.isPending && styles.resetButtonDisabled]} 
          activeOpacity={0.8}
          onPress={handleResetPassword}
          disabled={resetPasswordMutation.isPending}
        >
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.resetButtonGradient}
          >
            {resetPasswordMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    fontSize: 24,
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '500',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#4E4C57',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
  },
  eyeIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  resetButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
});

