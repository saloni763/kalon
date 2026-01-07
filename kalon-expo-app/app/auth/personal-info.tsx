import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BackArrowIcon from '@/components/BackArrowIcon';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { validateEmail, validateMobileNumber, validateName, validateDateOfBirth, validateYear, validateYearRange, validateDateRange, cleanMobileNumber } from '@/utils/validation';
import { useSignup } from '@/hooks/queries/useAuth';

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

type Gender = 'Male' | 'Female' | 'Other';

type EducationEntry = {
  id: string;
  schoolUniversity: string;
  degreeProgram: string;
  startYear: string;
  currentlyEnrolled: boolean;
  endYear: string;
  grade: string;
};

type RoleEntry = {
  id: string;
  currentRole: string;
  companyOrganisation: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  location: string;
};

type SkillItem = {
  id: string;
  name: string;
};

type SkillCategory = {
  id: string;
  name: string;
  items: SkillItem[];
};

const skillCategories: SkillCategory[] = [
  {
    id: 'popular',
    name: 'Popular Interests',
    items: [
      { id: 'social-networking', name: '🤝 Social Networking' },
      { id: 'community', name: '👥 Community' },
      { id: 'self-improvement', name: '📘 Self-Improvement' },
    ],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    items: [
      { id: 'design', name: '🎨 Design' },
      { id: 'photography', name: '📸 Photography' },
      { id: 'dancing', name: '💃 Dancing' },
      { id: 'videography', name: '📹 Videography' },
      { id: 'craft', name: '🧵 Craft' },
      { id: 'writing', name: '✍️ Writing' },
      { id: 'singing', name: '🎶 Singing' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    items: [
        { id: 'cricket', name: '🏏 Cricket' },
      { id: 'football', name: '⚽ Football' },
      { id: 'kabaddi', name: '🤼 Kabaddi' },
      { id: 'volleyball', name: '🏐 Volleyball' },
      { id: 'wrestling', name: '🤼‍♂️ Wrestling' },
      { id: 'chess', name: '♟️ Chess' },
      { id: 'athletics', name: '🏃‍♀️ Athletics' },
      { id: 'basketball', name: '🏀 Basketball' },
      { id: 'table-tennis', name: '🏓 Table Tennis' },
      { id: 'shooting', name: '🔫 Shooting' },
      { id: 'archery', name: '🏹 Archery' },
      { id: 'cycling', name: '🚴 Cycling' },
    ],
  },
  {
    id: 'career',
    name: 'Career & Business',
    items: [
      { id: 'govt-jobs', name: '👔 Government Jobs' },
      { id: 'private-jobs', name: '💼 Private Jobs' },
      { id: 'freelancing', name: '👩🏻‍💻 Freelancing' },
      { id: 'teaching', name: '👩‍🏫 Teaching' },
      { id: 'healthcare', name: '🏥 Healthcare' },
      { id: 'it/software', name: '💻 IT / Software' },
      { id: 'engineering', name: '👷‍♂️ Engineering' },
      { id: 'marketing-sales', name: '📢 Marketing & Sales' },
      { id: 'banking-finance', name: '🏦 Banking & Finance' },
      { id: 'agriculture', name: '🌾 Agriculture Sector' },
      { id: 'law/legal-services', name: '⚖️ Law / Legal Services' },
      { id: 'design/art', name: '🎨 Design / Art' },
      { id: 'food-business', name: '🍽️ Food Business' },
      { id: 'e-commerce', name: '🛒 E-commerce' },
      { id: 'transportation', name: '🚕 Transportation' },
      { id: 'logistics', name: '📦 Logistics' },
     
    ],
  },
  {
    id: 'community-env',
    name: 'Community & Environment',
    items: [
        { id: 'volunteering', name: '🫱🏻‍🫲🏽 Volunteering' },
      { id: 'youth-empowerment', name: '✊🏾 Youth Empowerment' },
      { id: 'women-rights', name: '🚺 Women’s Rights' },
      { id: 'education-access', name: '📚 Education Access' },
      { id: 'disaster-relief', name: '🆘 Disaster Relief' },
      { id: 'support-for-seniors', name: '👴🏻 Support for Seniors' },
      { id: 'farming', name: '🌾 Farming' },
      { id: 'waste-management', name: '♻️ Waste Management' },
      { id: 'tree-plantation', name: '🌱 Tree Plantation' },
      { id: 'clean-energy', name: '🔋 Clean Energy' },
      { id: 'animal-welfare', name: '🐾 Animal Welfare' },
      { id: 'sustainable-projects', name: '◾ Sustainability Projects' },
      { id: 'water-conservation', name: '🚰 Water Conservation' },
      { id: 'roommates', name: '👨🏽‍🤝‍👨🏼 Roommates' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellbeing',
    items: [
      { id: 'mental-health-awareness', name: '🧠 Mental Health Awareness' },
      { id: 'meditation', name: '☯ Meditation' },
      { id: 'yoga', name: '🧘 Yoga' },
      { id: 'nutrition', name: '🍎 Nutrition' },
      { id: 'fitness', name: '🏋 Fitness/Gym' },
      { id: 'healthy-eating', name: '🥗 Healthy Eating' },
      { id: 'digital-detox', name: '📵 Digital Detox' },
      { id: 'disability-support', name: '🧑‍🦽 Disability Support' },
    ],
  },
  {
    id: 'identity',
    name: 'Identity ',
    items: [
      { id: 'student', name: '👨‍🎓 Student' },
      { id: 'farmer', name: '👨‍🌾 Farmer' },
      { id: 'professional', name: '👩🏻‍💼 Professional' },
      { id: 'entrepreneur', name: '💼 Entrepreneur' },
      { id: 'artist/creator', name: '👨‍🎨 Artist/Creator' },
      { id: 'homemaker', name: '👷‍♂️ Homemaker' },
      { id: 'community-worker', name: '🧑‍💼 Community Worker' },
      { id: 'volunteer', name: '🫱🏻‍🫲🏽 Volunteer' },
      { id: 'activist', name: '✊ Activist' },
      { id: 'english', name: '𝗘𝗡 English' },
    ],
  },
];

export default function PersonalInfoScreen() {
  // Get signup data from route params
  const params = useLocalSearchParams<{ 
    name?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    countryCode?: string;
  }>();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1 = Personal Info, 2 = Education & Role, 3 = Skills & Interests, 4 = Goals & Preferences
  
  // TanStack Query mutation
  const signupMutation = useSignup();

  // Store signup password (needed for final submission)
  const [signupPassword] = useState(params.password || '');

  // Personal Info fields - pre-populate with signup data
  const [fullName, setFullName] = useState(params.name || '');
  const [fullNameError, setFullNameError] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [emailError, setEmailError] = useState('');
  const [countryCode, setCountryCode] = useState(params.countryCode || '+1');
  const [mobileNumber, setMobileNumber] = useState(params.mobileNumber || '');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  // Stored as local ISO date: YYYY-MM-DD
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Date picker UI + validation (DOB + role dates)
  const [dobError, setDobError] = useState<string | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobTempDate, setDobTempDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  });

  const [roleDateErrors, setRoleDateErrors] = useState<Record<string, { startDate?: string; endDate?: string }>>({});
  const [showRoleDatePicker, setShowRoleDatePicker] = useState(false);
  const [activeRoleDateField, setActiveRoleDateField] = useState<{ roleId: string; field: 'startDate' | 'endDate' } | null>(null);
  const [roleTempDate, setRoleTempDate] = useState<Date>(() => new Date());

  // Education year picker UI + validation
  const [educationYearErrors, setEducationYearErrors] = useState<Record<string, { startYear?: string; endYear?: string }>>({});
  const [showEducationYearPicker, setShowEducationYearPicker] = useState(false);
  const [activeEducationYearField, setActiveEducationYearField] = useState<{ educationId: string; field: 'startYear' | 'endYear' } | null>(null);

  // Education fields - array of education entries
  const [educations, setEducations] = useState<EducationEntry[]>([
    {
      id: '1',
      schoolUniversity: '',
      degreeProgram: '',
      startYear: '',
      currentlyEnrolled: true,
      endYear: '',
      grade: '',
    },
  ]);

  // Current Role fields - array of role entries
  const [roles, setRoles] = useState<RoleEntry[]>([
    {
      id: '1',
      currentRole: '',
      companyOrganisation: '',
      startDate: '',
      endDate: '',
      currentlyWorking: true,
      location: '',
    },
  ]);

  // Skills & Interests fields
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['popular', 'creativity']));

  // Goals & Preferences fields
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [networkVisibility, setNetworkVisibility] = useState<'public' | 'friends'>('public');

  const scrollViewRef = useRef<ScrollView>(null);

  // Handle full name change
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    if (text.length > 0) {
      const result = validateName(text);
      setFullNameError(result.error || '');
    } else {
      setFullNameError('');
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

  // Phone number formatting - using utility function
  const handlePhoneChange = (text: string) => {
    const cleaned = cleanMobileNumber(text);
    setMobileNumber(cleaned);
    if (cleaned.length > 0) {
      const result = validateMobileNumber(cleaned);
      setMobileNumberError(result.error || '');
    } else {
      setMobileNumberError('');
    }
  };

  // Local date helpers (avoid UTC shifting)
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toLocalISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const fromLocalISODate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };
  const formatDateLabel = (d: Date) => `${pad2(d.getDate())} / ${pad2(d.getMonth() + 1)} / ${d.getFullYear()}`;

  const DOB_MIN_AGE = 13;
  const DOB_MAX_AGE = 120;
  const now = new Date();
  const dobMaxDate = new Date(now.getFullYear() - DOB_MIN_AGE, now.getMonth(), now.getDate());
  const dobMinDate = new Date(now.getFullYear() - DOB_MAX_AGE, now.getMonth(), now.getDate());

  const validateDob = (iso: string) => {
    const result = validateDateOfBirth(iso, DOB_MIN_AGE, DOB_MAX_AGE);
    return result.error || null;
  };

  const YEAR_MIN = 1950;
  const YEAR_MAX = now.getFullYear();
  const isValidYear = (year: string) => {
    const result = validateYear(year, YEAR_MIN, YEAR_MAX);
    return result.isValid;
  };

  // Year values are selected via picker (no typing).

  // Education management
  const addNewEducation = () => {
    const newEducation: EducationEntry = {
      id: Date.now().toString(),
      schoolUniversity: '',
      degreeProgram: '',
      startYear: '',
      currentlyEnrolled: true,
      endYear: '',
      grade: '',
    };
    setEducations(prev => [...prev, newEducation]);
  };

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      setEducations(prev => prev.filter(edu => edu.id !== id));
    }
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string | boolean) => {
    setEducations(prev =>
      prev.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  // Role management
  const addNewRole = () => {
    const newRole: RoleEntry = {
      id: Date.now().toString(),
      currentRole: '',
      companyOrganisation: '',
      startDate: '',
      endDate: '',
      currentlyWorking: true,
      location: '',
    };
    setRoles(prev => [...prev, newRole]);
  };

  const removeRole = (id: string) => {
    if (roles.length > 1) {
      setRoles(prev => prev.filter(role => role.id !== id));
    }
  };

  const updateRole = (id: string, field: keyof RoleEntry, value: string | boolean) => {
    setRoles(prev =>
      prev.map(role => (role.id === id ? { ...role, [field]: value } : role))
    );
  };

  // Form validation
  const isPersonalInfoValid = () => {
    const nameResult = validateName(fullName);
    const emailResult = validateEmail(email);
    const mobileResult = validateMobileNumber(mobileNumber);
    const dobResult = validateDateOfBirth(dateOfBirth, DOB_MIN_AGE, DOB_MAX_AGE);
    
    return (
      nameResult.isValid &&
      emailResult.isValid &&
      mobileResult.isValid &&
      dobResult.isValid
    );
  };

  const isEducationRoleValid = () => {
    const hasValidEducation = educations.some(edu => {
      const basicValid = edu.schoolUniversity.trim().length > 0 &&
        edu.degreeProgram.trim().length > 0 &&
        isValidYear(edu.startYear);
      
      if (!edu.currentlyEnrolled) {
        const yearRangeResult = validateYearRange(edu.startYear, edu.endYear);
        return yearRangeResult.isValid;
      }
      return basicValid;
    });
    
    const hasValidRole = roles.some(role => {
      const basicValid = role.currentRole.trim().length > 0 &&
        role.companyOrganisation.trim().length > 0 &&
        role.startDate.trim().length > 0;

      const today = new Date();
      const start = fromLocalISODate(role.startDate);
      if (!basicValid || !start || start > today) return false;
      
      if (!role.currentlyWorking) {
        const dateRangeResult = validateDateRange(role.startDate, role.endDate);
        return dateRangeResult.isValid;
      }
      return true;
    });
    
    return hasValidEducation && hasValidRole;
  };

  // Skills & Interests management
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const isSkillsInterestsValid = () => {
    return selectedSkills.size > 0;
  };

  const isGoalsPreferencesValid = () => {
    return selectedGoals.size > 0;
  };

  const isFormValid = currentStep === 1 
    ? isPersonalInfoValid() 
    : currentStep === 2 
    ? isEducationRoleValid() 
    : currentStep === 3
    ? isSkillsInterestsValid()
    : isGoalsPreferencesValid();
  const isDisabled = !isFormValid;

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate all fields before proceeding
      const nameResult = validateName(fullName);
      const emailResult = validateEmail(email);
      const mobileResult = validateMobileNumber(mobileNumber);
      const dobResult = validateDateOfBirth(dateOfBirth, DOB_MIN_AGE, DOB_MAX_AGE);

      setFullNameError(nameResult.error || '');
      setEmailError(emailResult.error || '');
      setMobileNumberError(mobileResult.error || '');
      setDobError(dobResult.error || null);

      if (nameResult.isValid && emailResult.isValid && mobileResult.isValid && dobResult.isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const today = new Date();
      const nextEducationErrors: Record<string, { startYear?: string; endYear?: string }> = {};
      educations.forEach(edu => {
        const errs: { startYear?: string; endYear?: string } = {};
        if (!isValidYear(edu.startYear)) errs.startYear = 'Start year is required.';
        if (!edu.currentlyEnrolled) {
          if (!isValidYear(edu.endYear)) errs.endYear = 'End year is required.';
          else if (isValidYear(edu.startYear) && Number(edu.endYear) < Number(edu.startYear)) {
            errs.endYear = 'End year must be after start year.';
          }
        }
        if (errs.startYear || errs.endYear) nextEducationErrors[edu.id] = errs;
      });
      setEducationYearErrors(nextEducationErrors);

      const nextRoleErrors: Record<string, { startDate?: string; endDate?: string }> = {};
      roles.forEach(role => {
        const errs: { startDate?: string; endDate?: string } = {};
        const start = role.startDate ? fromLocalISODate(role.startDate) : null;
        if (!role.startDate || !start) errs.startDate = 'Start date is required.';
        else if (start > today) errs.startDate = 'Start date cannot be in the future.';

        if (!role.currentlyWorking) {
          const end = role.endDate ? fromLocalISODate(role.endDate) : null;
          if (!role.endDate || !end) errs.endDate = 'End date is required.';
          else if (end > today) errs.endDate = 'End date cannot be in the future.';
          else if (start && end < start) errs.endDate = 'End date must be after start date.';
        }
        if (errs.startDate || errs.endDate) nextRoleErrors[role.id] = errs;
      });
      setRoleDateErrors(nextRoleErrors);
      if (isEducationRoleValid()) setCurrentStep(3);
    } else if (currentStep === 3 && isSkillsInterestsValid()) {
      setCurrentStep(4);
    } else if (currentStep === 4 && isGoalsPreferencesValid()) {
      // Submit form - save all personal info to backend
      await handleSubmitPersonalInfo();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else {
      router.back();
    }
  };

  // Submit personal info and create user with all data
  const handleSubmitPersonalInfo = async () => {
    if (!email || !signupPassword) {
      Alert.alert('Error', 'Missing required information. Please go back to signup.');
      return;
    }

    try {
      // Prepare education data (remove id field, filter out empty entries)
      const educationData = educations
        .filter(edu => edu.schoolUniversity.trim() && edu.degreeProgram.trim() && edu.startYear)
        .map(edu => ({
          schoolUniversity: edu.schoolUniversity.trim(),
          degreeProgram: edu.degreeProgram.trim(),
          startYear: edu.startYear,
          currentlyEnrolled: edu.currentlyEnrolled,
          endYear: edu.currentlyEnrolled ? undefined : edu.endYear?.trim() || undefined,
          grade: edu.grade?.trim() || undefined,
        }));

      // Prepare role data (remove id field, filter out empty entries)
      const roleData = roles
        .filter(role => role.currentRole.trim() && role.companyOrganisation.trim() && role.startDate)
        .map(role => ({
          currentRole: role.currentRole.trim(),
          companyOrganisation: role.companyOrganisation.trim(),
          startDate: role.startDate,
          endDate: role.currentlyWorking ? undefined : role.endDate || undefined,
          currentlyWorking: role.currentlyWorking,
          location: role.location?.trim() || undefined,
        }));

      // Prepare skills and goals as arrays
      const skillsArray = Array.from(selectedSkills);
      const goalsArray = Array.from(selectedGoals);

      // Use fullName if provided, otherwise use the name from signup
      const finalName = fullName.trim() || params.name || '';
      const finalMobileNumber = mobileNumber || params.mobileNumber || '';

      if (!finalName || !finalMobileNumber) {
        Alert.alert('Error', 'Name and mobile number are required');
        return;
      }

      // Call signup API using TanStack Query
      await signupMutation.mutateAsync({
        name: finalName,
        email: email.toLowerCase().trim(),
        mobileNumber: finalMobileNumber,
        password: signupPassword,
        countryCode: countryCode || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        aboutMe: aboutMe.trim() || undefined,
        educations: educationData.length > 0 ? educationData : undefined,
        roles: roleData.length > 0 ? roleData : undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        goals: goalsArray.length > 0 ? goalsArray : undefined,
        networkVisibility: networkVisibility || undefined,
      });

      // Navigate to homepage on success
      router.push('/homepage/home');
    } catch (error: any) {
      // Show error message
      Alert.alert(
        'Signup Failed',
        error.message || 'Failed to create account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Goals & Preferences management
  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep]);

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, currentStep >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, currentStep >= 2 && styles.progressBarActive]} />
        <View style={[styles.progressBar, currentStep >= 3 && styles.progressBarActive]} />
        <View style={[styles.progressBar, currentStep >= 4 && styles.progressBarActive]} />
      </View>
    );
  };

  const renderPersonalInfoStep = () => (
    <>
      <Text style={styles.heading}>Personal Info</Text>
      <Text style={styles.subtitle}>Let's start with the basics.</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <View style={[
          styles.inputContainer,
          fullNameError && styles.inputErrorBorder
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999999"
            value={fullName}
            onChangeText={handleFullNameChange}
            onBlur={() => {
              const result = validateName(fullName);
              setFullNameError(result.error || '');
            }}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>
        {fullNameError ? (
          <Text style={styles.inputErrorText}>{fullNameError}</Text>
        ) : null}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={[
          styles.inputContainer,
          emailError && styles.inputErrorBorder
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
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
          <Text style={styles.inputErrorText}>{emailError}</Text>
        ) : null}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={[
          styles.mobileInputContainer,
          mobileNumberError && styles.inputErrorBorder
        ]}>
          <TouchableOpacity
            style={styles.countryCodeContainer}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.countryCodeText}>{countryCode}</Text>
          </TouchableOpacity>
          <View style={styles.mobileInput}>
            <TextInput
              style={styles.input}
              placeholder="Your number"
              placeholderTextColor="#999999"
              value={mobileNumber}
              onChangeText={handlePhoneChange}
              onBlur={() => {
                const result = validateMobileNumber(mobileNumber);
                setMobileNumberError(result.error || '');
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={10}
            />
          </View>
        </View>
        {mobileNumberError ? (
          <Text style={styles.inputErrorText}>{mobileNumberError}</Text>
        ) : null}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'Male' && styles.genderOptionActive
            ]}
            onPress={() => setGender('Male')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioButton,
              gender === 'Male' && styles.radioButtonActive
            ]}>
              {gender === 'Male' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={[
              styles.genderText,
              gender === 'Male' && styles.genderTextActive
            ]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'Female' && styles.genderOptionActive
            ]}
            onPress={() => setGender('Female')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioButton,
              gender === 'Female' && styles.radioButtonActive
            ]}>
              {gender === 'Female' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={[
              styles.genderText,
              gender === 'Female' && styles.genderTextActive
            ]}>
              Female
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'Other' && styles.genderOptionActive
            ]}
            onPress={() => setGender('Other')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioButton,
              gender === 'Other' && styles.radioButtonActive
            ]}>
              {gender === 'Other' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={[
              styles.genderText,
              gender === 'Other' && styles.genderTextActive
            ]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.dateInputContainer, dobError ? styles.inputErrorBorder : null]}
          onPress={() => {
            const existing = dateOfBirth ? fromLocalISODate(dateOfBirth) : null;
            setDobTempDate(existing ?? new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()));
            setShowDobPicker(true);
          }}
        >
          <Text style={[styles.dateDisplayText, !dateOfBirth ? styles.placeholderText : null]}>
            {dateOfBirth ? formatDateLabel(fromLocalISODate(dateOfBirth) ?? dobTempDate) : 'DD / MM / YYYY'}
          </Text>
          <View style={styles.calendarIconContainer}>
            <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
          </View>
        </TouchableOpacity>
        {!!dobError && <Text style={styles.inputErrorText}>{dobError}</Text>}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>About Me</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Write here..."
            placeholderTextColor="#999999"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </>
  );

  const renderEducationRoleStep = () => (
    <>
      <Text style={styles.heading}>Education & Role</Text>
      <Text style={styles.subtitle}>Tell us about your education and role.</Text>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Education</Text>
          <TouchableOpacity 
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={addNewEducation}
          >
            <Ionicons name="add-circle-outline" size={20} color="#AF7DFF" />
            <Text style={styles.addButtonText}>Add New Education</Text>
          </TouchableOpacity>
        </View>

        {educations.map((education, index) => (
          <View key={education.id} style={styles.educationEntryContainer}>
            {educations.length > 1 && (
              <View style={styles.entryHeader}>
                <Text style={styles.entryNumber}>Education {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeEducation(education.id)}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>School/University Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter School/University name"
                  placeholderTextColor="#999999"
                  value={education.schoolUniversity}
                  onChangeText={(text) => updateEducation(education.id, 'schoolUniversity', text)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Degree/Program</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Degree/Program name"
                  placeholderTextColor="#999999"
                  value={education.degreeProgram}
                  onChangeText={(text) => updateEducation(education.id, 'degreeProgram', text)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Start Year</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dateInputContainer,
                  educationYearErrors[education.id]?.startYear ? styles.inputErrorBorder : null
                ]}
                onPress={() => {
                  setActiveEducationYearField({ educationId: education.id, field: 'startYear' });
                  setShowEducationYearPicker(true);
                }}
              >
                <Text style={[styles.dateDisplayText, !education.startYear ? styles.placeholderText : null]}>
                  {education.startYear || 'Select year'}
                </Text>
                <View style={styles.calendarIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                </View>
              </TouchableOpacity>
              {!!educationYearErrors[education.id]?.startYear && (
                <Text style={styles.inputErrorText}>{educationYearErrors[education.id]?.startYear}</Text>
              )}
            </View>
            
            {!education.currentlyEnrolled && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>End Year</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.dateInputContainer,
                    educationYearErrors[education.id]?.endYear ? styles.inputErrorBorder : null
                  ]}
                  onPress={() => {
                    setActiveEducationYearField({ educationId: education.id, field: 'endYear' });
                    setShowEducationYearPicker(true);
                  }}
                >
                  <Text style={[styles.dateDisplayText, !education.endYear ? styles.placeholderText : null]}>
                    {education.endYear || 'Select year'}
                  </Text>
                  <View style={styles.calendarIconContainer}>
                    <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                  </View>
                </TouchableOpacity>
                {!!educationYearErrors[education.id]?.endYear && (
                  <Text style={styles.inputErrorText}>{educationYearErrors[education.id]?.endYear}</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                const newValue = !education.currentlyEnrolled;
                updateEducation(education.id, 'currentlyEnrolled', newValue);
                if (newValue) {
                  updateEducation(education.id, 'endYear', '');
                  setEducationYearErrors(prev => {
                    const next = { ...prev };
                    if (next[education.id]) {
                      const errs = { ...next[education.id] };
                      delete errs.endYear;
                      if (errs.startYear) next[education.id] = errs;
                      else delete next[education.id];
                    }
                    return next;
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, education.currentlyEnrolled && styles.checkboxChecked]}>
                {education.currentlyEnrolled && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Currently Enrolled</Text>
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Grade (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Grade"
                  placeholderTextColor="#999999"
                  value={education.grade}
                  onChangeText={(text) => updateEducation(education.id, 'grade', text)}
                />
              </View>
            </View>

            {index < educations.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Role</Text>
          <TouchableOpacity 
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={addNewRole}
          >
            <Ionicons name="add-circle-outline" size={20} color="#AF7DFF" />
            <Text style={styles.addButtonText}>Add New Role</Text>
          </TouchableOpacity>
        </View>

        {roles.map((role, index) => (
          <View key={role.id} style={styles.educationEntryContainer}>
            {roles.length > 1 && (
              <View style={styles.entryHeader}>
                <Text style={styles.entryNumber}>Role {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeRole(role.id)}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Current Role/Job Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter role/job title"
                  placeholderTextColor="#999999"
                  value={role.currentRole}
                  onChangeText={(text) => updateRole(role.id, 'currentRole', text)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Company/Organisation</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter company/organisation name"
                  placeholderTextColor="#999999"
                  value={role.companyOrganisation}
                  onChangeText={(text) => updateRole(role.id, 'companyOrganisation', text)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dateInputContainer,
                  roleDateErrors[role.id]?.startDate ? styles.inputErrorBorder : null
                ]}
                onPress={() => {
                  const existing = role.startDate ? fromLocalISODate(role.startDate) : null;
                  setRoleTempDate(existing ?? new Date());
                  setActiveRoleDateField({ roleId: role.id, field: 'startDate' });
                  setShowRoleDatePicker(true);
                }}
              >
                <Text style={[styles.dateDisplayText, !role.startDate ? styles.placeholderText : null]}>
                  {role.startDate
                    ? formatDateLabel(fromLocalISODate(role.startDate) ?? roleTempDate)
                    : 'DD / MM / YYYY'}
                </Text>
                <View style={styles.calendarIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                </View>
              </TouchableOpacity>
              {!!roleDateErrors[role.id]?.startDate && (
                <Text style={styles.inputErrorText}>{roleDateErrors[role.id]?.startDate}</Text>
              )}
            </View>
            
            {!role.currentlyWorking && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.dateInputContainer,
                    roleDateErrors[role.id]?.endDate ? styles.inputErrorBorder : null
                  ]}
                  onPress={() => {
                    const existing = role.endDate ? fromLocalISODate(role.endDate) : null;
                    const fallback = role.startDate ? (fromLocalISODate(role.startDate) ?? new Date()) : new Date();
                    setRoleTempDate(existing ?? fallback);
                    setActiveRoleDateField({ roleId: role.id, field: 'endDate' });
                    setShowRoleDatePicker(true);
                  }}
                >
                  <Text style={[styles.dateDisplayText, !role.endDate ? styles.placeholderText : null]}>
                    {role.endDate
                      ? formatDateLabel(fromLocalISODate(role.endDate) ?? roleTempDate)
                      : 'DD / MM / YYYY'}
                  </Text>
                  <View style={styles.calendarIconContainer}>
                    <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                  </View>
                </TouchableOpacity>
                {!!roleDateErrors[role.id]?.endDate && (
                  <Text style={styles.inputErrorText}>{roleDateErrors[role.id]?.endDate}</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                const newValue = !role.currentlyWorking;
                updateRole(role.id, 'currentlyWorking', newValue);
                if (newValue) {
                  updateRole(role.id, 'endDate', '');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, role.currentlyWorking && styles.checkboxChecked]}>
                {role.currentlyWorking && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Currently Working Here</Text>
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location"
                  placeholderTextColor="#999999"
                  value={role.location}
                  onChangeText={(text) => updateRole(role.id, 'location', text)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {index < roles.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </View>
    </>
  );

  const renderSkillsInterestsStep = () => (
    <>
      <Text style={styles.heading}>Skills & Interests</Text>
      <Text style={styles.subtitle}>Highlight what you're good at and passionate about.</Text>

      {skillCategories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        
        return (
          <View key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <View style={[styles.expandIcon, isExpanded && styles.expandIconExpanded]}>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.skillsContainer}>
                {category.items.map((item) => {
                  const isSelected = selectedSkills.has(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.skillTag,
                        isSelected ? styles.skillTagSelected : null
                      ]}
                      onPress={() => toggleSkill(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={
                        isSelected ? styles.skillTagTextSelected : styles.skillTagText
                      }>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </>
  );

  const goals = [
    { id: 'find-study-buddies', name: 'Find Study Buddies' },
    { id: 'collaborate-projects', name: 'Collaborate on Projects' },
    { id: 'join-campus-events', name: 'Join Campus Events' },
    { id: 'explore-internships-jobs', name: 'Explore Internships/Jobs' },
    { id: 'connect-mentors', name: 'Connect with Mentors' },
  ];

  const renderGoalsPreferencesStep = () => (
    <>
      <Text style={styles.heading}>Goals & Preferences</Text>
      <Text style={styles.subtitle}>What are you here for?</Text>

      <View style={styles.goalsSection}>
        <Text style={styles.sectionLabel}>I'm here to</Text>
        <Text style={styles.sectionHint}>You can select multiple.</Text>
        
        <View style={styles.goalsContainer}>
          {goals.map((goal) => {
            const isSelected = selectedGoals.has(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalButton,
                  isSelected && styles.goalButtonSelected
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.goalButtonText,
                  isSelected && styles.goalButtonTextSelected
                ]}>
                  {goal.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.networkVisibilitySection}>
        <Text style={styles.sectionLabel}>Preferred Network Visibility</Text>
        <Text style={styles.sectionHint}>You can change this whenever you want.</Text>
        
        <TouchableOpacity
          style={[
            styles.visibilityOption,
            networkVisibility === 'public' && styles.visibilityOptionSelected
          ]}
          onPress={() => setNetworkVisibility('public')}
          activeOpacity={0.7}
        >
          <View style={styles.visibilityOptionContent}>
            <Ionicons name="globe-outline" size={24} color={networkVisibility === 'public' ? '#AF7DFF' : '#4E4C57'} />
            <View style={styles.visibilityOptionTextContainer}>
              <Text style={[
                styles.visibilityOptionTitle,
                networkVisibility === 'public' && styles.visibilityOptionTitleSelected
              ]}>
                Public
              </Text>
              <Text style={styles.visibilityOptionSubtitle}>
                All students at your college
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            networkVisibility === 'public' && styles.radioButtonActive
          ]}>
            {networkVisibility === 'public' && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.visibilityOption,
            networkVisibility === 'friends' && styles.visibilityOptionSelected
          ]}
          onPress={() => setNetworkVisibility('friends')}
          activeOpacity={0.7}
        >
          <View style={styles.visibilityOptionContent}>
            <Ionicons name="people-outline" size={24} color={networkVisibility === 'friends' ? '#AF7DFF' : '#4E4C57'} />
            <View style={styles.visibilityOptionTextContainer}>
              <Text style={[
                styles.visibilityOptionTitle,
                networkVisibility === 'friends' && styles.visibilityOptionTitleSelected
              ]}>
                Friends only
              </Text>
              <Text style={styles.visibilityOptionSubtitle}>
                Just your added friends
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            networkVisibility === 'friends' && styles.radioButtonActive
          ]}>
            {networkVisibility === 'friends' && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
          nestedScrollEnabled={true}
        >
          {renderProgressBar()}

          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <BackArrowIcon width={30} height={30} color="#0D0A1B" />
          </TouchableOpacity>

          {currentStep === 1 
            ? renderPersonalInfoStep() 
            : currentStep === 2 
            ? renderEducationRoleStep() 
            : currentStep === 3
            ? renderSkillsInterestsStep()
            : renderGoalsPreferencesStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, (isDisabled || signupMutation.isPending) && styles.nextButtonDisabled]} 
          activeOpacity={0.8}
          onPress={handleNext}
          disabled={isDisabled || signupMutation.isPending}
        >
          {(isDisabled || signupMutation.isPending) ? (
            <View style={styles.nextButtonGradientDisabled}>
              {signupMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.nextButtonText, styles.nextButtonTextDisabled]}>
                  {currentStep === 4 ? 'Create Account' : 'Next'}
                </Text>
              )}
            </View>
          ) : (
            <LinearGradient
              colors={['#AF7DFF', '#9D6BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Create Account' : 'Next'}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {currentStep === 1 && (
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
      )}

      {/* DOB picker (iOS in modal, Android native) */}
      {showDobPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dobTempDate}
          mode="date"
          maximumDate={dobMaxDate}
          minimumDate={dobMinDate}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (event.type === 'dismissed') {
              setShowDobPicker(false);
              return;
            }
            const picked = selectedDate ?? dobTempDate;
            const iso = toLocalISODate(picked);
            setDateOfBirth(iso);
            setDobError(validateDob(iso));
            setShowDobPicker(false);
          }}
        />
      )}
      {showDobPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowDobPicker(false)}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowDobPicker(false)}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={() => setShowDobPicker(false)} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select date</Text>
                <TouchableOpacity
                  onPress={() => {
                    const iso = toLocalISODate(dobTempDate);
                    setDateOfBirth(iso);
                    setDobError(validateDob(iso));
                    setShowDobPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerHeaderButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dobTempDate}
                mode="date"
                display="spinner"
                maximumDate={dobMaxDate}
                minimumDate={dobMinDate}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setDobTempDate(selectedDate);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Role date picker (iOS in modal, Android native) */}
      {showRoleDatePicker && activeRoleDateField && Platform.OS === 'android' && (
        <DateTimePicker
          value={roleTempDate}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (event.type === 'dismissed') {
              setShowRoleDatePicker(false);
              setActiveRoleDateField(null);
              return;
            }
            const picked = selectedDate ?? roleTempDate;
            const iso = toLocalISODate(picked);
            updateRole(activeRoleDateField.roleId, activeRoleDateField.field, iso);
            setRoleDateErrors(prev => {
              const next = { ...prev };
              const errs = { ...(next[activeRoleDateField.roleId] ?? {}) };

              const role = roles.find(r => r.id === activeRoleDateField.roleId);
              const today = new Date();
              if (activeRoleDateField.field === 'startDate') {
                const start = fromLocalISODate(iso);
                if (!iso || !start) errs.startDate = 'Start date is required.';
                else if (start > today) errs.startDate = 'Start date cannot be in the future.';
                else errs.startDate = undefined;

                if (role?.endDate) {
                  const end = fromLocalISODate(role.endDate);
                  if (end && start && end < start) errs.endDate = 'End date must be after start date.';
                  else if (end && end > today) errs.endDate = 'End date cannot be in the future.';
                  else errs.endDate = undefined;
                }
              } else {
                const end = fromLocalISODate(iso);
                const start = role?.startDate ? fromLocalISODate(role.startDate) : null;
                if (!iso || !end) errs.endDate = 'End date is required.';
                else if (end > today) errs.endDate = 'End date cannot be in the future.';
                else if (start && end < start) errs.endDate = 'End date must be after start date.';
                else errs.endDate = undefined;
              }

              if (errs.startDate || errs.endDate) next[activeRoleDateField.roleId] = errs;
              else delete next[activeRoleDateField.roleId];
              return next;
            });
            setShowRoleDatePicker(false);
            setActiveRoleDateField(null);
          }}
        />
      )}
      {showRoleDatePicker && activeRoleDateField && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowRoleDatePicker(false)}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowRoleDatePicker(false)}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity
                  onPress={() => {
                    setShowRoleDatePicker(false);
                    setActiveRoleDateField(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select date</Text>
                <TouchableOpacity
                  onPress={() => {
                    const iso = toLocalISODate(roleTempDate);
                    updateRole(activeRoleDateField.roleId, activeRoleDateField.field, iso);
                    setRoleDateErrors(prev => {
                      const next = { ...prev };
                      const errs = { ...(next[activeRoleDateField.roleId] ?? {}) };
                      const role = roles.find(r => r.id === activeRoleDateField.roleId);
                      const today = new Date();

                      if (activeRoleDateField.field === 'startDate') {
                        const start = fromLocalISODate(iso);
                        if (!iso || !start) errs.startDate = 'Start date is required.';
                        else if (start > today) errs.startDate = 'Start date cannot be in the future.';
                        else errs.startDate = undefined;

                        if (role?.endDate) {
                          const end = fromLocalISODate(role.endDate);
                          if (end && start && end < start) errs.endDate = 'End date must be after start date.';
                          else if (end && end > today) errs.endDate = 'End date cannot be in the future.';
                          else errs.endDate = undefined;
                        }
                      } else {
                        const end = fromLocalISODate(iso);
                        const start = role?.startDate ? fromLocalISODate(role.startDate) : null;
                        if (!iso || !end) errs.endDate = 'End date is required.';
                        else if (end > today) errs.endDate = 'End date cannot be in the future.';
                        else if (start && end < start) errs.endDate = 'End date must be after start date.';
                        else errs.endDate = undefined;
                      }

                      if (errs.startDate || errs.endDate) next[activeRoleDateField.roleId] = errs;
                      else delete next[activeRoleDateField.roleId];
                      return next;
                    });
                    setShowRoleDatePicker(false);
                    setActiveRoleDateField(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerHeaderButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={roleTempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setRoleTempDate(selectedDate);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Education year picker */}
      {showEducationYearPicker && activeEducationYearField && (
        <Modal
          transparent
          animationType="slide"
          visible
          onRequestClose={() => {
            setShowEducationYearPicker(false);
            setActiveEducationYearField(null);
          }}
        >
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowEducationYearPicker(false);
              setActiveEducationYearField(null);
            }}
          >
            <View style={[styles.pickerSheet, { paddingBottom: 0 }]}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity
                  onPress={() => {
                    setShowEducationYearPicker(false);
                    setActiveEducationYearField(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select year</Text>
                <View style={{ width: 56 }} />
              </View>

              <ScrollView>
                {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => String(YEAR_MAX - i)).map((year) => {
                  const edu = educations.find(e => e.id === activeEducationYearField.educationId);
                  const selected =
                    activeEducationYearField.field === 'startYear'
                      ? edu?.startYear === year
                      : edu?.endYear === year;

                  return (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.countryCodeOption,
                        selected && styles.countryCodeOptionSelected
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        const { educationId, field } = activeEducationYearField;
                        updateEducation(educationId, field, year);

                        setEducationYearErrors(prev => {
                          const next = { ...prev };
                          const errs = { ...(next[educationId] ?? {}) };
                          const eduNow = educations.find(e => e.id === educationId);
                          const startYear = field === 'startYear' ? year : (eduNow?.startYear ?? '');
                          const endYear = field === 'endYear' ? year : (eduNow?.endYear ?? '');

                          if (!isValidYear(startYear)) errs.startYear = 'Start year is required.';
                          else errs.startYear = undefined;

                          if (eduNow && !eduNow.currentlyEnrolled) {
                            if (!isValidYear(endYear)) errs.endYear = 'End year is required.';
                            else if (isValidYear(startYear) && Number(endYear) < Number(startYear)) errs.endYear = 'End year must be after start year.';
                            else errs.endYear = undefined;
                          } else {
                            errs.endYear = undefined;
                          }

                          if (errs.startYear || errs.endYear) next[educationId] = errs;
                          else delete next[educationId];
                          return next;
                        });

                        setShowEducationYearPicker(false);
                        setActiveEducationYearField(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.countryCodeOptionText,
                          selected && styles.countryCodeOptionTextSelected
                        ]}
                      >
                        {year}
                      </Text>
                      {selected && <Ionicons name="checkmark" size={20} color="#AF7DFF" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 110,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AF7DFF33',
  },
  progressBarActive: {
    backgroundColor: '#AF7DFF',
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
    marginBottom: 24,
    opacity: 0.8,
  },
  inputWrapper: {
    marginBottom: 20,
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
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 12,
    paddingVertical: 6,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  mobileInput: {
    flex: 1,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    padding: 0,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderOptionActive: {
    // Add any active styling if needed
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#AF7DFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AF7DFF',
  },
  genderText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  genderTextActive: {
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    padding: 0,
  },
  dateDisplayText: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    paddingVertical: 6,
  },
  placeholderText: {
    color: '#999999',
    fontFamily: 'Montserrat_400Regular',
  },
  calendarIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
  inputErrorText: {
    marginTop: 6,
    color: '#FF4444',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  inputErrorBorder: {
    borderBottomWidth: 1,
    borderColor: '#FF4444',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerHeaderTitle: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pickerHeaderButton: {
    fontSize: 14,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    padding: 0,
    minHeight: 80,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  educationEntryContainer: {
    marginBottom: 24,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entryNumber: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 35,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  nextButtonDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  nextButtonGradientDisabled: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CFB1FF',
  },
  nextButtonTextDisabled: {
    color: '#FFFFFF',
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
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  categoryTitle: {
    fontSize: 18,
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  },
  expandIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconExpanded: {
    backgroundColor: '#AF7DFF',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minHeight: 40,
    backgroundColor: '#F5EEFF',
  },
  skillTagSelected: {
    backgroundColor: '#AF7DFF',
    borderWidth: 0,
  },
  skillIcon: {
    marginRight: 2,
  },
  skillTagText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
  },
  skillTagTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  goalsSection: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    marginBottom: 3,
  },
  sectionHint: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 16,
    opacity: 0.8,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F5EEFF',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#AF7DFF',
  },
  goalButtonText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  goalButtonTextSelected: {
    color: '#FFFFFF',
  },
  networkVisibilitySection: {
    marginBottom: 32,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5EEFF',
    marginBottom: 12,
  },
  visibilityOptionSelected: {
    backgroundColor: '#F5EEFF',
  },
  visibilityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  visibilityOptionTextContainer: {
    flex: 1,
  },
  visibilityOptionTitle: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  visibilityOptionTitleSelected: {
    color: '#0D0A1B',
  },
  visibilityOptionSubtitle: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
});
