import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useUser, useUpdatePersonalInfo } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

export default function PersonalInfoScreen() {
  const user = useUser();
  const updatePersonalInfo = useUpdatePersonalInfo();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [aboutMe, setAboutMe] = useState(user?.aboutMe || 'I love connecting with 👯people and sharing 💡ideas. Big fan of creativity, good coffee, and late-night brainstorming. Here to learn, create, and have fun doing it.');

  const handleSave = async () => {
    try {
      await updatePersonalInfo.mutateAsync({
        fullName: fullName,
        email: email,
        dateOfBirth: dateOfBirth,
        aboutMe: aboutMe,
      });
      showToast.success('Personal information updated successfully');
      router.back();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update personal information');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.divider} />

        {/* Scrollable Content */}
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#999999"
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Email Address Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.inputUnderline} />
            </View>

            {/* Date of Birth Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={styles.dateInput}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="21 / 03 / 1996"
                  placeholderTextColor="#999999"
                />
                <TouchableOpacity style={styles.calendarIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputUnderline} />
            </View>

            {/* About Me Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>About Me</Text>
              <TextInput
                style={styles.textArea}
                value={aboutMe}
                onChangeText={setAboutMe}
                placeholder="Tell us about yourself"
                placeholderTextColor="#999999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.inputUnderline} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, updatePersonalInfo.isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={updatePersonalInfo.isPending}
          >
            <Text style={styles.saveButtonText}>
              {updatePersonalInfo.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerSpacer: {
    width: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  input: {
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  calendarIcon: {
    padding: 4,
  },
  textArea: {
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
    minHeight: 120,
    fontFamily: 'Montserrat_400Regular',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#AF7DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

