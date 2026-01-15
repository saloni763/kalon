import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import BackArrowIcon from '@/components/BackArrowIcon';
import PrivateIcon from '@/assets/icons/private.svg'
import InviteIcon from '@/assets/icons/invite.svg'
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadPhotoIcon from '@/assets/icons/upload-img.svg';
import DeletePhotoIcon from '@/assets/icons/delete.svg';
import { useCreateEvent } from '@/hooks/queries/useEvents';
import { uploadImage } from '@/services/uploadService';
import { showToast } from '@/utils/toast';

type EventMode = 'Online' | 'Offline';

type EventType = 'Public' | 'Private';

interface FormErrors {
  eventName?: string;
  hostBy?: string;
  eventDate?: string;
  fromTime?: string;
  toTime?: string;
  description?: string;
  category?: string;
  eventType?: string;
}

type EventCategory = {
  id: string;
  name: string;
  icon: string; // Can be emoji or Ionicons icon name
  isEmoji?: boolean; // Flag to indicate if icon is an emoji
};

const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'music', name: 'Music', icon: '📺', isEmoji: true },
  { id: 'sports', name: 'Sports', icon: '⚽', isEmoji: true },
  { id: 'health', name: 'Health', icon: '🏥', isEmoji: true },
  { id: 'community', name: 'Community', icon: ' ✈️', isEmoji: true },
  { id: 'tech', name: 'Tech', icon: '💼', isEmoji: true },
  { id: 'education', name: 'Education', icon: '🎓', isEmoji: true },
  { id: 'art-culture', name: 'Art & Culture', icon: '🎨', isEmoji: true },
  { id: 'festive', name: 'Festive', icon: '📢', isEmoji: true },
  { id: 'gaming', name: 'Gaming', icon: '🎮', isEmoji: true },
];

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1 = Event Info, 2 = Event Category, 3 = Event Type, 4 = Event Thumbnail
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [hostBy, setHostBy] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [fromTime, setFromTime] = useState<Date | null>(null);
  const [toTime, setToTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [eventMode, setEventMode] = useState<EventMode>('Online');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventType>('Public');
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null); // Local image URI before upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // React Query hooks
  const createEventMutation = useCreateEvent();

  const SELECTED_FRIENDS_KEY = '@kalon_selected_friends';

  // Sample friends data - should match invite-friends.tsx
  const SAMPLE_FRIENDS = [
    { id: '1', name: 'Adele Ogletree', username: 'adele98', picture: null, isVerified: false },
    { id: '2', name: 'Richard Rodriguez', username: 'rich_ez', picture: null, isVerified: false },
    { id: '3', name: 'Dana Forcier', username: 'dana-for2', picture: null, isVerified: false },
    { id: '4', name: 'Brandi Johnson', username: 'brandi_joh', picture: null, isVerified: true },
    { id: '5', name: 'Anika Patel', username: 'patel-ani', picture: null, isVerified: false },
    { id: '6', name: 'Adele Nguyen', username: 'adele_nguyen23', picture: null, isVerified: false },
    { id: '7', name: 'Anastasia Georgiou', username: 'georgiou09', picture: null, isVerified: false },
    { id: '8', name: 'Ayaka Tanaka', username: 'tanaka_sd', picture: null, isVerified: false },
    { id: '9', name: 'Ansel Müller', username: 'muller_34', picture: null, isVerified: false },
    { id: '10', name: 'Aaron Kim', username: 'kim2', picture: null, isVerified: true },
  ];

  // Load selected friends when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadSelectedFriends = async () => {
        try {
          const stored = await AsyncStorage.getItem(SELECTED_FRIENDS_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setSelectedFriends(parsed);
          }
        } catch (error) {
          console.error('Error loading selected friends:', error);
        }
      };
      loadSelectedFriends();
    }, [])
  );

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempFromTime, setTempFromTime] = useState(new Date());
  const [tempToTime, setTempToTime] = useState(new Date());

  // Helper function to get initials
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get selected friends data
  const getSelectedFriendsData = () => {
    return SAMPLE_FRIENDS.filter(friend => selectedFriends.includes(friend.id));
  };

  const displayedFriends = showAllFriends 
    ? getSelectedFriendsData() 
    : getSelectedFriendsData().slice(0, 3);
  
  const remainingCount = selectedFriends.length - 3;

  // Format date as DD / MM / YYYY
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day} / ${month} / ${year}`;
  };

  // Format time as HH:MM AM/PM
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Validation functions
  const validateEventName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Event name is required';
    }
    if (name.trim().length < 3) {
      return 'Event name must be at least 3 characters';
    }
    if (name.trim().length > 100) {
      return 'Event name must be less than 100 characters';
    }
    return undefined;
  };

  const validateHostBy = (host: string): string | undefined => {
    if (!host.trim()) {
      return 'Host name is required';
    }
    if (host.trim().length < 2) {
      return 'Host name must be at least 2 characters';
    }
    return undefined;
  };

  const validateDate = (date: Date | null): string | undefined => {
    if (!date) {
      return 'Event date is required';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'Event date cannot be in the past';
    }
    return undefined;
  };

  const validateTimeRange = (from: Date | null, to: Date | null): { fromError?: string; toError?: string } => {
    const errors: { fromError?: string; toError?: string } = {};
    
    if (!from) {
      errors.fromError = 'Start time is required';
    }
    if (!to) {
      errors.toError = 'End time is required';
    }
    
    if (from && to) {
      const fromMinutes = from.getHours() * 60 + from.getMinutes();
      const toMinutes = to.getHours() * 60 + to.getMinutes();
      
      if (toMinutes <= fromMinutes) {
        errors.toError = 'End time must be after start time';
      }
    }
    
    return errors;
  };

  const validateDescription = (desc: string): string | undefined => {
    if (desc.trim().length > 500) {
      return 'Description must be less than 500 characters';
    }
    return undefined;
  };

  // Handle field changes with validation
  const handleEventNameChange = (text: string) => {
    setEventName(text);
    if (errors.eventName) {
      const error = validateEventName(text);
      setErrors(prev => ({ ...prev, eventName: error }));
    }
  };

  const handleHostByChange = (text: string) => {
    setHostBy(text);
    if (errors.hostBy) {
      const error = validateHostBy(text);
      setErrors(prev => ({ ...prev, hostBy: error }));
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (errors.description) {
      const error = validateDescription(text);
      setErrors(prev => ({ ...prev, description: error }));
    }
  };

  // Date picker handlers
  const handleDatePress = () => {
    setTempDate(eventDate || new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') return;
      if (selectedDate) {
        setEventDate(selectedDate);
        const error = validateDate(selectedDate);
        setErrors(prev => ({ ...prev, eventDate: error }));
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDateConfirm = () => {
    setEventDate(tempDate);
    const error = validateDate(tempDate);
    setErrors(prev => ({ ...prev, eventDate: error }));
    setShowDatePicker(false);
  };

  // From time handlers
  const handleFromTimePress = () => {
    setTempFromTime(fromTime || new Date());
    setShowFromTimePicker(true);
  };

  const handleFromTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowFromTimePicker(false);
      if (event.type === 'dismissed') return;
      if (selectedDate) {
        setFromTime(selectedDate);
        const timeErrors = validateTimeRange(selectedDate, toTime);
        setErrors(prev => ({ ...prev, fromTime: timeErrors.fromError, toTime: timeErrors.toError }));
      }
    } else {
      if (selectedDate) {
        setTempFromTime(selectedDate);
      }
    }
  };

  const handleFromTimeConfirm = () => {
    setFromTime(tempFromTime);
    const timeErrors = validateTimeRange(tempFromTime, toTime);
    setErrors(prev => ({ ...prev, fromTime: timeErrors.fromError, toTime: timeErrors.toError }));
    setShowFromTimePicker(false);
  };

  // To time handlers
  const handleToTimePress = () => {
    setTempToTime(toTime || new Date());
    setShowToTimePicker(true);
  };

  const handleToTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowToTimePicker(false);
      if (event.type === 'dismissed') return;
      if (selectedDate) {
        setToTime(selectedDate);
        const timeErrors = validateTimeRange(fromTime, selectedDate);
        setErrors(prev => ({ ...prev, fromTime: timeErrors.fromError, toTime: timeErrors.toError }));
      }
    } else {
      if (selectedDate) {
        setTempToTime(selectedDate);
      }
    }
  };

  const handleToTimeConfirm = () => {
    setToTime(tempToTime);
    const timeErrors = validateTimeRange(fromTime, tempToTime);
    setErrors(prev => ({ ...prev, fromTime: timeErrors.fromError, toTime: timeErrors.toError }));
    setShowToTimePicker(false);
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.eventName = validateEventName(eventName);
    newErrors.hostBy = validateHostBy(hostBy);
    newErrors.eventDate = validateDate(eventDate);
    const timeErrors = validateTimeRange(fromTime, toTime);
    newErrors.fromTime = timeErrors.fromError;
    newErrors.toTime = timeErrors.toError;
    newErrors.description = validateDescription(description);
    
    setErrors(newErrors);
    
    // Check if form is valid
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const isFormValid = (): boolean => {
    return (
      eventName.trim().length >= 3 &&
      hostBy.trim().length >= 2 &&
      eventDate !== null &&
      fromTime !== null &&
      toTime !== null &&
      toTime > fromTime &&
      (description.trim().length === 0 || description.trim().length <= 500)
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 form
      if (validateForm()) {
        setCurrentStep(2);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        // Scroll to first error
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } else if (currentStep === 2) {
      // Validate category selection
      if (!selectedCategory) {
        setErrors(prev => ({ ...prev, category: 'Please select a category' }));
        return;
      }
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 3) {
      // Validate event type selection
      if (!eventType) {
        setErrors(prev => ({ ...prev, eventType: 'Please select an event type' }));
        return;
      }
      setCurrentStep(4);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 4) {
      // Create event - thumbnail is optional
      handleCreateEvent();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 3) {
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 4) {
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleEventTypeSelect = (type: EventType) => {
    setEventType(type);
    setErrors(prev => ({ ...prev, eventType: undefined }));
    if (type === 'Private') {
      setShowInviteFriends(true);
    } else {
      setShowInviteFriends(false);
    }
  };

  const handleInviteFriends = () => {
    router.push('/events/invite-friends' as any);
  };

  const handleCreateEvent = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      if (!selectedCategory) {
        setErrors(prev => ({ ...prev, category: 'Please select a category' }));
        return;
      }

      let finalThumbnailUri: string | null = null;

      // Step 1: Upload image if one was selected (and it's a local URI, not already a URL)
      if (selectedImageUri && !selectedImageUri.startsWith('http')) {
        setIsUploadingImage(true);
        try {
          const uploadResponse = await uploadImage(selectedImageUri, 'events');
          finalThumbnailUri = uploadResponse.imageUrl;
        } catch (error: any) {
          setIsUploadingImage(false);
          showToast.error(error.message || 'Failed to upload image');
          return;
        }
        setIsUploadingImage(false);
      } else if (thumbnailUri && thumbnailUri.startsWith('http')) {
        // Already a URL (from previous upload or external source)
        finalThumbnailUri = thumbnailUri;
      }

      // Step 2: Prepare event data
      const eventData = {
        eventName: eventName.trim(),
        hostBy: hostBy.trim(),
        eventDate: eventDate!.toISOString(),
        fromTime: fromTime!.toISOString(),
        toTime: toTime!.toISOString(),
        description: description.trim() || undefined,
        eventMode,
        selectedCategory,
        eventType,
        selectedFriends: eventType === 'Private' ? selectedFriends : undefined,
        thumbnailUri: finalThumbnailUri || undefined,
      };

      // Step 3: Create event
      await createEventMutation.mutateAsync(eventData);

      // Success - navigate to events list
      showToast.success('Event created successfully!');
      router.replace('/events/events' as any);
    } catch (error: any) {
      console.error('Error creating event:', error);
      showToast.error(error.message || 'Failed to create event. Please try again.');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setErrors(prev => ({ ...prev, category: undefined }));
  };

  const handleUploadPhoto = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        setThumbnailUri(imageUri); // Show preview
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast.error('Failed to select image');
    }
  };

  const handleDeleteThumbnail = () => {
    setThumbnailUri(null);
    setSelectedImageUri(null);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, currentStep >= 1 && styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, currentStep >= 2 && styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, currentStep >= 3 && styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, currentStep >= 4 && styles.progressSegmentActive]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton} 
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <BackArrowIcon width={24} height={24} color="#0D0A1B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 ? (
              <>
                {/* Title Section */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Event Info</Text>
                  <Text style={styles.subtitle}>Let's start with the basics.</Text>
                </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Event Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Event Name</Text>
                <View style={[styles.inputWrapper, errors.eventName && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={eventName}
                    onChangeText={handleEventNameChange}
                    onBlur={() => {
                      const error = validateEventName(eventName);
                      setErrors(prev => ({ ...prev, eventName: error }));
                    }}
                    placeholder="Enter name"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    accessibilityLabel="Event name"
                    accessibilityHint="Enter the name of your event"
                  />
                </View>
                {errors.eventName ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {errors.eventName}
                  </Text>
                ) : null}
                <View style={[styles.inputUnderline, errors.eventName && styles.inputUnderlineError]} />
              </View>

              {/* Host By */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Host By</Text>
                <View style={[styles.inputWrapper, errors.hostBy && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={hostBy}
                    onChangeText={handleHostByChange}
                    onBlur={() => {
                      const error = validateHostBy(hostBy);
                      setErrors(prev => ({ ...prev, hostBy: error }));
                    }}
                    placeholder="Enter name"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    accessibilityLabel="Host name"
                    accessibilityHint="Enter the name of the event host"
                  />
                </View>
                {errors.hostBy ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {errors.hostBy}
                  </Text>
                ) : null}
                <View style={[styles.inputUnderline, errors.hostBy && styles.inputUnderlineError]} />
              </View>

              {/* Date */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeInputContainer,
                    errors.eventDate && styles.dateTimeInputContainerError
                  ]}
                  onPress={handleDatePress}
                  activeOpacity={0.7}
                  accessibilityLabel="Select event date"
                  accessibilityHint="Tap to open date picker"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.dateTimeInput,
                    !eventDate && styles.dateTimeInputPlaceholder
                  ]}>
                    {formatDate(eventDate) || 'DD / MM / YYYY'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={errors.eventDate ? '#FF3B30' : '#4E4C57'} />
                </TouchableOpacity>
                {errors.eventDate ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {errors.eventDate}
                  </Text>
                ) : null}
                <View style={[styles.inputUnderline, errors.eventDate && styles.inputUnderlineError]} />
              </View>

              {/* Time */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.timeContainer}>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>From</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateTimeInputContainer,
                        errors.fromTime && styles.dateTimeInputContainerError
                      ]}
                      onPress={handleFromTimePress}
                      activeOpacity={0.7}
                      accessibilityLabel="Select start time"
                      accessibilityHint="Tap to open time picker"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.dateTimeInput,
                        !fromTime && styles.dateTimeInputPlaceholder
                      ]}>
                        {formatTime(fromTime) || 'Select'}
                      </Text>
                      <Ionicons name="time-outline" size={20} color={errors.fromTime ? '#FF3B30' : '#4E4C57'} />
                    </TouchableOpacity>
                    {errors.fromTime ? (
                      <Text style={styles.errorText} accessibilityLiveRegion="polite">
                        {errors.fromTime}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>To</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateTimeInputContainer,
                        errors.toTime && styles.dateTimeInputContainerError
                      ]}
                      onPress={handleToTimePress}
                      activeOpacity={0.7}
                      accessibilityLabel="Select end time"
                      accessibilityHint="Tap to open time picker"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.dateTimeInput,
                        !toTime && styles.dateTimeInputPlaceholder
                      ]}>
                        {formatTime(toTime) || 'Select'}
                      </Text>
                      <Ionicons name="time-outline" size={20} color={errors.toTime ? '#FF3B30' : '#4E4C57'} />
                    </TouchableOpacity>
                    {errors.toTime ? (
                      <Text style={styles.errorText} accessibilityLiveRegion="polite">
                        {errors.toTime}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.inputUnderline} />
              </View>

              {/* Event Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Event Description</Text>
                <View style={[styles.inputWrapper, errors.description && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.textArea}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    onBlur={() => {
                      const error = validateDescription(description);
                      setErrors(prev => ({ ...prev, description: error }));
                    }}
                    placeholder="Write here..."
                    placeholderTextColor="#999999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                    accessibilityLabel="Event description"
                    accessibilityHint="Enter a description for your event"
                  />
                </View>
                <View style={styles.descriptionFooter}>
                  {errors.description ? (
                    <Text style={styles.errorText} accessibilityLiveRegion="polite">
                      {errors.description}
                    </Text>
                  ) : (
                    <Text style={styles.characterCount}>
                      {description.length}/500
                    </Text>
                  )}
                </View>
                <View style={[styles.inputUnderline, errors.description && styles.inputUnderlineError]} />
              </View>

              {/* Event Mode */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Event Mode</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventMode('Online')}
                    activeOpacity={0.7}
                    accessibilityLabel="Online event"
                    accessibilityRole="radio"
                    accessibilityState={{ selected: eventMode === 'Online' }}
                  >
                    <View style={styles.radioButton}>
                      {eventMode === 'Online' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Online</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventMode('Offline')}
                    activeOpacity={0.7}
                    accessibilityLabel="Offline event"
                    accessibilityRole="radio"
                    accessibilityState={{ selected: eventMode === 'Offline' }}
                  >
                    <View style={styles.radioButton}>
                      {eventMode === 'Offline' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Offline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
            ) : currentStep === 2 ? (
              <>
                {/* Event Category Step */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Event Category</Text>
                  <Text style={styles.subtitle}>Select Event Category (You can select only one)</Text>
                </View>

                {/* Category Grid */}
                <View style={styles.categoryGrid}>
                  {EVENT_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id && styles.categoryItemSelected
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                      activeOpacity={0.7}
                      accessibilityLabel={`${category.name} category`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedCategory === category.id }}
                    >
                      <View style={[
                        styles.categoryIconContainer,
                        selectedCategory === category.id && styles.categoryIconContainerSelected
                      ]}>
                        {category.isEmoji ? (
                          <Text style={styles.categoryEmoji}>{category.icon}</Text>
                        ) : (
                          <Ionicons 
                            name={category.icon as keyof typeof Ionicons.glyphMap} 
                            size={32} 
                            color={selectedCategory === category.id ? '#AF7DFF' : '#4E4C57'} 
                          />
                        )}
                      </View>
                      <Text style={[
                        styles.categoryName,
                        selectedCategory === category.id && styles.categoryNameSelected
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.category ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {errors.category}
                  </Text>
                ) : null}
              </>
            ) : currentStep === 3 ? (
              <>
                {/* Event Type Step */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Event Type</Text>
                  <Text style={styles.subtitle}>Select your Event type</Text>
                </View>

                {/* Event Type Cards */}
                <View style={styles.eventTypeContainer}>
                  {/* Public Option */}
                  <TouchableOpacity
                    style={[
                      styles.eventTypeCard,
                      eventType === 'Public' && styles.eventTypeCardSelected
                    ]}
                    onPress={() => handleEventTypeSelect('Public')}
                    activeOpacity={0.7}
                    accessibilityLabel="Public event"
                    accessibilityRole="radio"
                    accessibilityState={{ selected: eventType === 'Public' }}
                  >
                    <View style={styles.eventTypeContent}>
                      <View style={styles.eventTypeIconContainer}>
                        <Ionicons 
                          name="globe-outline" 
                          size={28} 
                          color={eventType === 'Public' ? '#AF7DFF' : '#4E4C57'} 
                        />
                      </View>
                      <View style={styles.eventTypeTextContainer}>
                        <Text style={styles.eventTypeTitle}>Public</Text>
                        <Text style={styles.eventTypeDescription}>
                          Visible and open to everyone. Anyone can participate event.
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioButton}>
                      {eventType === 'Public' && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>

                  {/* Private Option */}
                  <TouchableOpacity
                    style={[
                      styles.eventTypeCard,
                      eventType === 'Private' && styles.eventTypeCardSelected
                    ]}
                    onPress={() => handleEventTypeSelect('Private')}
                    activeOpacity={0.7}
                    accessibilityLabel="Private event"
                    accessibilityRole="radio"
                    accessibilityState={{ selected: eventType === 'Private' }}
                  >
                    <View style={styles.eventTypeContent}>
                      <View style={styles.eventTypeIconContainer}>
                        <Ionicons 
                          name="people-outline" 
                          size={28} 
                          color={eventType === 'Private' ? '#AF7DFF' : '#AF7DFF'} 
                        />
                      </View>
                      <View style={styles.eventTypeTextContainer}>
                        <Text style={styles.eventTypeTitle}>Private</Text>
                        <Text style={styles.eventTypeDescription}>
                          Only invited members can participate event.
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioButton}>
                      {eventType === 'Private' && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>
                </View>

                {errors.eventType ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {errors.eventType}
                  </Text>
                ) : null}

                {/* Invite Friends Section - Only show when Private is selected */}
                {eventType === 'Private' && (
                  <View style={styles.inviteFriendsSection}>
                    <TouchableOpacity
                      style={styles.inviteFriendsHeader}
                      onPress={handleInviteFriends}
                      activeOpacity={0.7}
                      accessibilityLabel="Invite friends"
                      accessibilityRole="button"
                    >
                      <View style={styles.inviteFriendsIconContainer}>
                        <InviteIcon />
                      </View>
                      <Text style={styles.inviteFriendsText}>Invite friends</Text>
                    </TouchableOpacity>

                    {/* Selected Friends Count */}
                    {selectedFriends.length > 0 && (
                      <View style={styles.selectedFriendsInfo}>
                        <Text style={styles.selectedFriendsCount}>
                          {selectedFriends.length} {selectedFriends.length === 1 ? 'friend' : 'friends'} selected
                        </Text>
                      </View>
                    )}

                    {/* Selected Friends List */}
                    {selectedFriends.length > 0 && (
                      <View style={styles.selectedFriendsList}>
                        {displayedFriends.map((friend) => (
                          <View key={friend.id} style={styles.selectedFriendItem}>
                            <View style={styles.profileImageContainer}>
                              {friend.picture ? (
                                <Image
                                  source={{ uri: friend.picture }}
                                  style={styles.profileImage}
                                />
                              ) : (
                                <View style={styles.profileImagePlaceholder}>
                                  <Text style={styles.profileImageText}>
                                    {getInitials(friend.name)}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.friendDetails}>
                              <View style={styles.nameRow}>
                                <Text style={styles.friendName}>{friend.name}</Text>
                                {friend.isVerified && (
                                  <Ionicons 
                                    name="checkmark-circle" 
                                    size={16} 
                                    color="#AF7DFF" 
                                    style={styles.verifiedBadge}
                                  />
                                )}
                              </View>
                              <Text style={styles.username}>@{friend.username}</Text>
                            </View>
                          </View>
                        ))}
                        
                        {/* View All Link */}
                        {!showAllFriends && remainingCount > 0 && (
                          <TouchableOpacity
                            onPress={() => setShowAllFriends(true)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.viewAllText}>
                              View All ({remainingCount} more)
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {showAllFriends && remainingCount > 0 && (
                          <TouchableOpacity
                            onPress={() => setShowAllFriends(false)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.viewAllText}>Show Less</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : currentStep === 4 ? (
              <>
                {/* Event Thumbnail Step */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Event Thumbnail</Text>
                  <Text style={styles.subtitle}>Upload your event thumbnail photo</Text>
                </View>

                {/* Upload Photo Section */}
                <TouchableOpacity
                  style={styles.uploadPhotoContainer}
                  onPress={handleUploadPhoto}
                  activeOpacity={0.7}
                  accessibilityLabel="Upload photo"
                  accessibilityRole="button"
                >
                  <View style={styles.uploadPhotoIconContainer}>
                    <UploadPhotoIcon width={32} height={32} color="#AF7DFF" />
                  </View>
                  <Text style={styles.uploadPhotoText}>Upload Photo</Text>
                </TouchableOpacity>

                {/* Thumbnail Display - Show below upload section if image is uploaded */}
                {thumbnailUri && (
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: thumbnailUri }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.deleteThumbnailButton}
                      onPress={handleDeleteThumbnail}
                      activeOpacity={0.7}
                      accessibilityLabel="Delete thumbnail"
                      accessibilityRole="button"
                    >
                      <DeletePhotoIcon width={18} height={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>

          {/* Next Button */}
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                (currentStep === 1 && !isFormValid()) || 
                (currentStep === 2 && !selectedCategory) ||
                (currentStep === 3 && !eventType)
                  ? styles.nextButtonDisabled 
                  : styles.nextButtonActive
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={
                (currentStep === 1 && !isFormValid()) || 
                (currentStep === 2 && !selectedCategory) ||
                (currentStep === 3 && !eventType)
                // Step 4 (thumbnail) is optional, so button is always enabled
              }
              accessibilityLabel={
                currentStep === 1 ? "Continue to category selection" : 
                currentStep === 2 ? "Continue to event type selection" :
                currentStep === 3 ? "Continue to thumbnail upload" :
                "Create event"
              }
              accessibilityRole="button"
              accessibilityState={{ 
                disabled: (currentStep === 1 && !isFormValid()) || 
                          (currentStep === 2 && !selectedCategory) ||
                          (currentStep === 3 && !eventType)
              }}
            >
              {createEventMutation.isPending || isUploadingImage ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={[styles.nextButtonText, styles.nextButtonTextActive, { marginLeft: 8 }]}>
                    {isUploadingImage ? 'Uploading...' : 'Creating...'}
                  </Text>
                </View>
              ) : (
                <Text style={[
                  styles.nextButtonText,
                  (currentStep === 1 && !isFormValid()) || 
                  (currentStep === 2 && !selectedCategory) ||
                  (currentStep === 3 && !eventType)
                    ? styles.nextButtonTextDisabled 
                    : styles.nextButtonTextActive
                ]}>
                  {currentStep === 4 ? 'Create Event' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Date Picker Modal (iOS) */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowDatePicker(false)}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowDatePicker(false)}>
            <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleDateConfirm} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Date Picker (Android) */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* From Time Picker Modal (iOS) */}
      {showFromTimePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowFromTimePicker(false)}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowFromTimePicker(false)}>
            <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={() => setShowFromTimePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select Time</Text>
                <TouchableOpacity onPress={handleFromTimeConfirm} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempFromTime}
                mode="time"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempFromTime(selectedDate);
                }}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* From Time Picker (Android) */}
      {showFromTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempFromTime}
          mode="time"
          onChange={handleFromTimeChange}
        />
      )}

      {/* To Time Picker Modal (iOS) */}
      {showToTimePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowToTimePicker(false)}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowToTimePicker(false)}>
            <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={() => setShowToTimePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select Time</Text>
                <TouchableOpacity onPress={handleToTimeConfirm} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempToTime}
                mode="time"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempToTime(selectedDate);
                }}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* To Time Picker (Android) */}
      {showToTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempToTime}
          mode="time"
          onChange={handleToTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#AF7DFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  formContainer: {
    gap: 28,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inputWrapper: {
    minHeight: 44,
  },
  inputWrapperError: {
    // Error state handled by underline
  },
  input: {
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontFamily: 'Montserrat_400Regular',
    minHeight: 44,
  },
  dateTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 44,
  },
  dateTimeInputContainerError: {
    // Error styling handled by icon color
  },
  dateTimeInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  dateTimeInputPlaceholder: {
    color: '#999999',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 8,
  },
  inputUnderlineError: {
    backgroundColor: '#FF3B30',
    height: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    fontFamily: 'Montserrat_400Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  textArea: {
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 12,
    paddingHorizontal: 0,
    minHeight: 100,
    fontFamily: 'Montserrat_400Regular',
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    minHeight: 18,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Montserrat_400Regular',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#AF7DFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#E8D5FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonActive: {
    backgroundColor: '#AF7DFF',
    shadowOpacity: 0.2,
  },
  nextButtonDisabled: {
    backgroundColor: '#F5F5F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerHeaderButton: {
    fontSize: 16,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryItemSelected: {
    // Selected state handled by icon container
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainerSelected: {
    backgroundColor: '#AF7DFF',
    borderWidth: 2,
    borderColor: '#AF7DFF',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventTypeContainer: {
    gap: 16,
    marginTop: 8,
  },
  eventTypeCard: {
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F5EEFF',
    minHeight: 100,
  },
  eventTypeCardSelected: {
    backgroundColor: '#E8D5FF',
    borderColor: '#AF7DFF',
    borderWidth: 2,
  },
  eventTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  eventTypeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventTypeTextContainer: {
    flex: 1,
  },
  eventTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventTypeDescription: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
  },
  inviteFriendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
  },
  inviteFriendsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteFriendsText: {
    fontSize: 18,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  inviteFriendsSection: {
    marginTop: 24,
  },
  inviteFriendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
  },
  selectedFriendsInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  selectedFriendsCount: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  selectedFriendsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  selectedFriendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  friendDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  username: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  viewAllText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    paddingVertical: 12,
    textAlign: 'center',
  },
  uploadPhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  uploadPhotoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadPhotoText: {
    fontSize: 16,
    color: '#C4A5F5',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  thumbnailContainer: {
    marginTop: 24,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  thumbnailImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  deleteThumbnailButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
