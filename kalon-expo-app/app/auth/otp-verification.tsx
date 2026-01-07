import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BackArrowIcon from '@/components/BackArrowIcon';
import { useVerifyOTP, useForgotPassword } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';

const { width, height } = Dimensions.get('window');

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  // TanStack Query mutations
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useForgotPassword();
  
  // Get all params - for signup flow, we need to pass all signup data through
  const params = useLocalSearchParams<{ 
    email?: string; 
    flow?: string;
    name?: string;
    mobileNumber?: string;
    password?: string;
    countryCode?: string;
  }>();
  
  const displayEmail = params.email || 'your email';
  const isSignupFlow = params.flow === 'signup';
  const isPasswordResetFlow = params.flow === 'password-reset';

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend && params.email) {
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '']);
      
      resendOTPMutation.mutate(
        { emailOrPhone: params.email },
        {
          onSuccess: () => {
            showToast.success('A new OTP code has been sent to your email/phone.');
          },
          onError: (error: any) => {
            showToast.error(error.message || 'Failed to resend OTP. Please try again.');
            // Reset timer if resend fails
            setCanResend(true);
          },
        }
      );
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    
    // Validate OTP is complete (4 digits)
    if (otpCode.length !== 4) {
      showToast.error('Please enter all 4 digits of the OTP code.', 'Incomplete OTP');
      return;
    }

    // Check if all digits are filled
    if (otp.some(digit => digit === '')) {
      showToast.error('Please enter all 4 digits of the OTP code.', 'Incomplete OTP');
      return;
    }

    if (!params.email) {
      showToast.error('Email/Phone number is required.');
      return;
    }

    // Verify OTP with backend using TanStack Query
    verifyOTPMutation.mutate(
      {
        emailOrPhone: params.email,
        otp: otpCode,
        purpose: isPasswordResetFlow ? 'password-reset' : 'email-verification',
      },
      {
        onSuccess: () => {
      if (isSignupFlow) {
        // Navigate to personal info page with all signup data
        router.push({
          pathname: '/auth/personal-info',
          params: {
            name: params.name || '',
            email: params.email || '',
            mobileNumber: params.mobileNumber || '',
            password: params.password || '',
            countryCode: params.countryCode || '',
          }
        });
          } else if (isPasswordResetFlow) {
            // Navigate to create new password for forgot password flow
            router.push({
              pathname: '/auth/create-new-password',
              params: {
                email: params.email,
                otp: otpCode,
              }
            });
      } else {
            // Default flow - navigate to create new password
            router.push({
              pathname: '/auth/create-new-password',
              params: {
                email: params.email,
                otp: otpCode,
              }
            });
      }
        },
        onError: (error: any) => {
      // Handle verification error
          showToast.error(
        error.message || 'Invalid OTP code. Please try again.',
            'Verification Failed'
      );
        },
    }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        {/* OTP Verification Heading */}
        <Text style={styles.heading}>
          {isSignupFlow ? 'Verify Your Email' : 'OTP Verification'}
        </Text>
        
        {/* Instructional Text */}
        <Text style={styles.instructionText}>
          {isSignupFlow ? (
            <>
              We've sent a 4-digit OTP to your <Text style={styles.emailText}>{displayEmail}</Text>. Please enter the code below to verify your email.
            </>
          ) : (
            <>
              We have sent an OTP code to your email <Text style={styles.emailText}>{displayEmail}</Text>. Enter the OTP code below to verify.
            </>
          )}
        </Text>
        

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref: any) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                (focusedIndex === index || digit) && styles.otpInputFocused
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[styles.verifyButton, verifyOTPMutation.isPending && styles.verifyButtonDisabled]} 
          activeOpacity={0.8}
          onPress={handleVerify}
          disabled={verifyOTPMutation.isPending}
        >
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyButtonGradient}
          >
            {verifyOTPMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>
                {isSignupFlow ? 'Verify & Continue' : 'Verify'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend Code Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendQuestion}>Didn't receive email?</Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              You can resend code in <Text style={styles.timerText}>{timeLeft} s</Text>
            </Text>
          )}
        </View>
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
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    lineHeight: 24,
    opacity: 0.8, 
  },
  emailText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 0,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
    minWidth: 40,
  },
  otpInputFocused: {
    borderBottomColor: '#AF7DFF',
  },
  verifyButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendQuestion: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 15,
  },
  resendLink: {
    fontSize: 14,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  resendTimer: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  timerText: {
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});

