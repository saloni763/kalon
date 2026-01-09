import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BackArrowIcon from '@/components/BackArrowIcon';
import { validateEmailOrPhone } from '@/utils/validation';
import { useForgotPassword } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // TanStack Query mutation for forgot password
  const forgotPasswordMutation = useForgotPassword();

  // Handle email/phone change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0) {
      const result = validateEmailOrPhone(text);
      setEmailError(result.error || '');
    } else {
      setEmailError('');
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

        {/* Forgot Password Heading */}
        <Text style={styles.heading}>Forgot Password</Text>
        
        {/* Instructional Text */}
        <Text style={styles.instructionText}>
          Please enter your email and we will send an OTP code in the next step to reset your password
        </Text>

        {/* Email/Phone Number Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email/Phone Number</Text>
          <View style={[
            styles.inputContainer,
            emailError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Email/Phone Number"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => {
                const result = validateEmailOrPhone(email);
                setEmailError(result.error || '');
              }}
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="off"
            />
            {!emailError && email.length > 0 && validateEmailOrPhone(email).isValid && (
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity 
          style={[styles.resetButton, forgotPasswordMutation.isPending && styles.resetButtonDisabled]} 
          activeOpacity={0.8}
          disabled={forgotPasswordMutation.isPending}
          onPress={() => {
            const result = validateEmailOrPhone(email);
            setEmailError(result.error || '');
            
            if (result.isValid) {
              forgotPasswordMutation.mutate(
                { emailOrPhone: email },
                {
                  onSuccess: () => {
                    showToast.success('OTP has been sent to your email/phone number');
                    // Navigate to OTP verification screen
                    router.push({
                      pathname: '/auth/otp-verification',
                      params: { 
                        email: email,
                        flow: 'password-reset'
                      }
                    });
                  },
                  onError: (error: any) => {
                    showToast.error(
                      error.message || 'Failed to send OTP. Please try again.'
                    );
                  },
                }
              );
            }
          }}
        >
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.resetButtonGradient}
          >
            {forgotPasswordMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Back to </Text>
            <Text style={styles.loginLink}>Login</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#4E4C57',
  },
  inputContainerError: {
    borderBottomColor: '#FF3B30',
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
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
    padding: 0,
  },
  checkIconContainer: {
    marginLeft: 8,
  },
  resetButton: {
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  backToLoginText: {
    fontSize: 17,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  loginLink: {
    fontSize: 16,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_400Regular',
  },
});

