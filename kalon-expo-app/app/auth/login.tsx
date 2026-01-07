import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from '@/components/AppLogo';
import GoogleIcon from '@/components/GoogleLogo';
import EmailIcon from '@/components/EmailLogo';
import { validateEmailOrPhone, validatePassword } from '@/utils/validation';
import { useLogin, useGoogleLogin } from '@/hooks/queries/useAuth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // TanStack Query mutations
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

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

  // Handle password change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0) {
      const result = validatePassword(text);
      setPasswordError(result.error || '');
    } else {
      setPasswordError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo at top left */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <AppLogo width={35} height={52} />
          </View>
          <Text style={styles.logoText}>Kalon</Text>
        </View>

        {/* Login Heading */}
        <Text style={styles.loginHeading}>Login</Text>
        
        {/* Welcome Message */}
        <View style={styles.welcomeMessageContainer}>
          <Text style={styles.welcomeMessage}>Welcome back.</Text>
          <Text style={styles.welcomeMessage}>You've been missed!</Text>
        </View>

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
                <Ionicons name="checkmark-circle-outline" size={24} color="#05B773" />
              </View>
            )}
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
              placeholder="Password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={() => {
                const result = validatePassword(password);
                setPasswordError(result.error || '');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
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


        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loginMutation.isPending && styles.loginButtonDisabled]} 
          activeOpacity={0.8}
          disabled={loginMutation.isPending}
          onPress={async () => {
            const emailResult = validateEmailOrPhone(email);
            const passwordResult = validatePassword(password);
            
            setEmailError(emailResult.error || '');
            setPasswordError(passwordResult.error || '');
            
            if (emailResult.isValid && passwordResult.isValid) {
              try {
                await loginMutation.mutateAsync({
                  emailOrPhone: email,
                  password: password,
                });
                
                // Login successful - token and user data are automatically saved by useLogin hook
                // Navigate to home screen
                router.replace('/homepage/home');
              } catch (error: any) {
                // Show error message
                Alert.alert(
                  'Login Failed',
                  error.message || 'Invalid email/phone number or password',
                  [{ text: 'OK' }]
                );
              }
            }
          }}
        >
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButtonGradient}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Remember Me and Forgot Password Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color="#AF7DFF" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue with Google Button */}
        <TouchableOpacity 
          style={[styles.socialButton, googleLoginMutation.isPending && styles.socialButtonDisabled]} 
          activeOpacity={0.7}
          disabled={googleLoginMutation.isPending}
          onPress={async () => {
            try {
              await googleLoginMutation.mutateAsync();
              // Google login successful - token and user data are automatically saved
              // Navigate to home screen
              router.replace('/homepage/home');
            } catch (error: any) {
              // Show error message
              Alert.alert(
                'Google Login Failed',
                error.message || 'Failed to login with Google. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }}
        >
          <View style={styles.socialButtonContent}>
            <View style={styles.socialIconContainer}>
              {googleLoginMutation.isPending ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <GoogleIcon />
              )}
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

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  logoWrapper: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    color: '#382F59',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  },
  loginHeading: {
    fontSize: 24,
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeMessageContainer: {
    marginBottom: 32,
  },
  welcomeMessage: {
    fontSize: 20,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
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
    borderRadius: 12,
    paddingVertical: 12,
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
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
    padding: 0,
  },
  checkIconContainer: {
    marginLeft: 8,
  },
  eyeIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#ffffff',
    borderColor: '#AF7DFF',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconContainer: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  signupLink: {
    fontSize: 16,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
});

