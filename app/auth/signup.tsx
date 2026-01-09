import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BackArrowIcon from '@/components/BackArrowIcon';
import GoogleIcon from '@/components/ui/GoogleLogo';
import EmailIcon from '@/components/ui/EmailLogo';
import { validateEmail, validateMobileNumber, validatePassword, validateName, cleanMobileNumber } from '@/utils/validation';

const { width, height } = Dimensions.get('window');

// Common country codes
const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+61', country: 'AU' },
];

export default function SignupScreen() {
  const [accountType, setAccountType] = useState<'Personal' | 'Business'>('Personal');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle name change
  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 0) {
      const result = validateName(text);
      setNameError(result.error || '');
    } else {
      setNameError('');
    }
  };

  // Handle mobile number change
  const handleMobileNumberChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '');
    setMobileNumber(cleaned);
    if (cleaned.length > 0) {
      const result = validateMobileNumber(cleaned);
      setMobileNumberError(result.error || '');
    } else {
      setMobileNumberError('');
    }
  };

  // Handle email change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0) {
      const result = validateEmail(text);
      setEmailError(result.error || '');
    } else {
      setEmailError('');
    }
  };

  // Handle password change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0) {
      const result = validatePassword(text, {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
      });
      setPasswordError(result.error || '');
    } else {
      setPasswordError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
        {/* Back Arrow */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <BackArrowIcon width={30} height={30} color="#0D0A1B" />
        </TouchableOpacity>

        {/* Create Account Heading */}
        <Text style={styles.heading}>Create Account</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>Let's get you set up in just a few steps.</Text>

        {/* Account Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              accountType === 'Personal' && styles.toggleOptionActive
            ]}
            onPress={() => setAccountType('Personal')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.toggleText,
              accountType === 'Personal' && styles.toggleTextActive
            ]}>
              Personal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              accountType === 'Business' && styles.toggleOptionActive
            ]}
            onPress={() => setAccountType('Business')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.toggleText,
              accountType === 'Business' && styles.toggleTextActive
            ]}>
              Business
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Name</Text>
          <View style={[
            styles.inputContainer,
            nameError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999999"
              value={name}
              onChangeText={handleNameChange}
              onBlur={() => {
                const result = validateName(name);
                setNameError(result.error || '');
              }}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>
          {nameError ? (
            <Text style={styles.errorText}>{nameError}</Text>
          ) : null}
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={[
            styles.mobileInputContainer,
            mobileNumberError && styles.mobileInputContainerError
          ]}>
            <TouchableOpacity
              style={styles.countryCodeContainer}
              onPress={() => setShowCountryPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Ionicons name="chevron-down" size={20} color="#4E4C57" />
            </TouchableOpacity>
            <View style={styles.mobileInput}>
              <TextInput
                style={styles.input}
                placeholder="Your number"
                placeholderTextColor="#999999"
                value={mobileNumber}
                onChangeText={handleMobileNumberChange}
                onBlur={() => validateMobileNumber(mobileNumber)}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={10}
              />
            </View>
          </View>
          {mobileNumberError ? (
            <Text style={styles.errorText}>{mobileNumberError}</Text>
          ) : null}
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={[
            styles.inputContainer,
            emailError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => {
                const result = validateEmail(email);
                setEmailError(result.error || '');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[
            styles.inputContainer,
            passwordError && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={() => {
                const result = validatePassword(password, {
                  minLength: 8,
                  requireUppercase: true,
                  requireLowercase: true,
                  requireNumber: true,
                  requireSpecialChar: true,
                });
                setPasswordError(result.error || '');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconContainer}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={async () => {
            // Validate all fields before proceeding
            const nameResult = validateName(name);
            const emailResult = validateEmail(email);
            const mobileResult = validateMobileNumber(mobileNumber);
            const passwordResult = validatePassword(password, {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumber: true,
              requireSpecialChar: true,
            });

            setNameError(nameResult.error || '');
            setEmailError(emailResult.error || '');
            setMobileNumberError(mobileResult.error || '');
            setPasswordError(passwordResult.error || '');
            
            // Only proceed if ALL validations pass, including password
            if (nameResult.isValid && emailResult.isValid && mobileResult.isValid && passwordResult.isValid) {
              // Navigate to OTP verification with signup data
              // After OTP verification, user will proceed to personal info
              // The actual signup API call happens in personal-info.tsx after collecting all data
              router.push({
                pathname: '/auth/otp-verification',
                params: {
                  flow: 'signup',
                  email: email.toLowerCase().trim(),
                  name: name.trim(),
                  mobileNumber: mobileNumber,
                  password: password,
                  countryCode: countryCode,
                }
              });
            } else {
              // Scroll to first error field if validation fails
              if (!nameResult.isValid || !emailResult.isValid || !mobileResult.isValid || !passwordResult.isValid) {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }
            }
          }}
        >
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue with Google Button */}
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <View style={styles.socialButtonContent}>
            <View style={styles.socialIconContainer}>
              <GoogleIcon />
            </View>
          </View>
        </TouchableOpacity>

        {/* Continue with Email Button */}
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <View style={styles.socialButtonContent}>
            <View style={styles.socialIconContainer}>
              <EmailIcon />
            </View>
            </View>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {countryCodes.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.countryCodeOption,
                    countryCode === item.code && styles.countryCodeOptionSelected
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.countryCodeOptionText,
                    countryCode === item.code && styles.countryCodeOptionTextSelected
                  ]}>
                    {item.code} ({item.country})
                  </Text>
                  {countryCode === item.code && (
                    <Ionicons name="checkmark" size={20} color="#AF7DFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  heading: {
    fontSize: 24,
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 20,
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AF7DFF',
    marginBottom: 20,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AF7DFF',
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    
  },
  toggleText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '500',
   
  },
  toggleTextActive: {
    color: '#AF7DFF',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#4E4C57',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderBottomWidth: 1,
    borderColor: '#4E4C57',
  },
  mobileInputContainerError: {
    borderColor: '#FF3B30',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
    marginRight: 8,
  },
  mobileInput: {
    flex: 1,
    paddingVertical: 6,
    fontFamily: 'Montserrat_600SemiBold',

  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  continueButton: {
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#AF7DFF',
    marginBottom: 12,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconContainer: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  loginLink: {
    fontSize: 16,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.5,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  modalTitle: {
    fontSize: 18,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  countryCodeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  countryCodeOptionSelected: {
    backgroundColor: '#F5F0FF',
  },
  countryCodeOptionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  countryCodeOptionTextSelected: {
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
});

