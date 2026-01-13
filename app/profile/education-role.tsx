import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useUser, useUpdatePersonalInfo } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface EducationEntry {
  schoolUniversity: string;
  degreeProgram: string;
  startYear: string;
  currentlyEnrolled: boolean;
  endYear?: string;
  grade?: string;
}

interface RoleEntry {
  currentRole: string;
  companyOrganisation: string;
  startDate: string;
  currentlyWorking: boolean;
  endDate?: string;
  location?: string;
  description?: string;
}

// Date helpers - simplified and consistent
const pad2 = (n: number) => String(n).padStart(2, '0');
const toLocalISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromLocalISODate = (iso: string): Date | null => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};
const formatDateDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = fromLocalISODate(dateStr);
  if (!date) return dateStr; // Return as-is if can't parse
  return `${pad2(date.getDate())} / ${pad2(date.getMonth() + 1)} / ${date.getFullYear()}`;
};

// Year constants
const YEAR_MIN = 1950;
const YEAR_MAX = new Date().getFullYear();
const isValidYear = (year: string): boolean => {
  const numYear = Number(year);
  return year.length === 4 && !isNaN(numYear) && numYear >= YEAR_MIN && numYear <= YEAR_MAX;
};

// Helper to safely extract plain object from Mongoose document or plain object
const extractPlainObject = (item: any): any => {
  if (!item || typeof item !== 'object') return item;
  
  // If it's a Mongoose document with _doc, use _doc
  if (item._doc && typeof item._doc === 'object') {
    return item._doc;
  }
  
  // If it has toObject method, use it
  if (item.toObject && typeof item.toObject === 'function') {
    return item.toObject();
  }
  
  // Otherwise return as plain object
  return item;
};

// Helper to initialize educations from user data
const initializeEducations = (userEducations?: any[]): EducationEntry[] => {
  if (!userEducations?.length) {
    return [{ schoolUniversity: '', degreeProgram: '', startYear: '', currentlyEnrolled: true }];
  }
  return userEducations.map((edu) => {
    const plainEdu = extractPlainObject(edu);
    return {
      schoolUniversity: plainEdu.schoolUniversity || '',
      degreeProgram: plainEdu.degreeProgram || '',
      startYear: plainEdu.startYear || '',
      currentlyEnrolled: plainEdu.currentlyEnrolled ?? true,
      endYear: plainEdu.endYear || undefined,
      grade: plainEdu.grade || undefined,
    };
  });
};

// Helper to initialize roles from user data
const initializeRoles = (userRoles?: any[]): RoleEntry[] => {
  if (!userRoles?.length) {
    return [{ currentRole: '', companyOrganisation: '', startDate: '', currentlyWorking: true }];
  }
  return userRoles.map((role) => {
    const plainRole = extractPlainObject(role);
    // Backend sends YYYY-MM-DD, convert to display format
    const startDate = plainRole.startDate || '';
    const endDate = plainRole.endDate || '';
    return {
      currentRole: plainRole.currentRole || '',
      companyOrganisation: plainRole.companyOrganisation || '',
      startDate: formatDateDisplay(startDate),
      currentlyWorking: plainRole.currentlyWorking ?? true,
      endDate: endDate ? formatDateDisplay(endDate) : undefined,
      location: plainRole.location || undefined,
      description: plainRole.description || undefined,
    };
  });
};

export default function EducationRoleScreen() {
  const user = useUser();
  const updatePersonalInfo = useUpdatePersonalInfo();

  // Initialize educations and roles from user data using helper functions
  const [educations, setEducations] = useState<EducationEntry[]>(
    () => initializeEducations(user?.educations)
  );

  const [roles, setRoles] = useState<RoleEntry[]>(
    () => initializeRoles(user?.roles)
  );

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      // Use helper functions to properly extract and map the data
      const mappedEducations = initializeEducations(user.educations);
      const mappedRoles = initializeRoles(user.roles);
      
      setEducations(mappedEducations);
      setRoles(mappedRoles);
    } else {
      // Reset to empty state if no user data
      setEducations([{
        schoolUniversity: '',
        degreeProgram: '',
        startYear: '',
        currentlyEnrolled: true,
        endYear: undefined,
        grade: undefined,
      }]);
      setRoles([{
        currentRole: '',
        companyOrganisation: '',
        startDate: '',
        currentlyWorking: true,
        endDate: undefined,
        location: undefined,
        description: undefined,
      }]);
    }
  }, [user]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'education' | 'role'>('role');
  
  // Form state for modal
  const [formData, setFormData] = useState<Partial<EducationEntry & RoleEntry>>({
    schoolUniversity: '',
    degreeProgram: '',
    startYear: '',
    currentlyEnrolled: false,
    grade: '',
    currentRole: '',
    companyOrganisation: '',
    startDate: '',
    currentlyWorking: false,
    endDate: '',
    location: '',
    description: '',
  });

  // Unified picker state
  const [pickerState, setPickerState] = useState<{
    type: 'date' | 'year' | null;
    context: 'main' | 'modal';
    target: { index?: number; field: string } | null;
    tempDate?: Date;
  }>({ type: null, context: 'main', target: null });

  const handleAddEducation = () => {
    setModalType('education');
    setFormData({
      schoolUniversity: '',
      degreeProgram: '',
      startYear: '',
      currentlyEnrolled: false,
      grade: '',
    });
    setShowModal(true);
  };

  const handleAddRole = () => {
    setModalType('role');
    setFormData({
      currentRole: '',
      companyOrganisation: '',
      startDate: '',
      currentlyWorking: false,
      endDate: '',
      location: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      schoolUniversity: '',
      degreeProgram: '',
      startYear: '',
      currentlyEnrolled: false,
      grade: '',
      currentRole: '',
      companyOrganisation: '',
      startDate: '',
      currentlyWorking: false,
      endDate: '',
      location: '',
      description: '',
    });
  };

  const handleModalAdd = () => {
    if (modalType === 'education') {
      const newEducation: EducationEntry = {
        schoolUniversity: formData.schoolUniversity || '',
        degreeProgram: formData.degreeProgram || '',
        startYear: formData.startYear || '',
        currentlyEnrolled: formData.currentlyEnrolled || false,
        endYear: formData.endYear,
        grade: formData.grade,
      };
      setEducations([...educations, newEducation]);
    } else {
      const newRole: RoleEntry = {
        currentRole: formData.currentRole || '',
        companyOrganisation: formData.companyOrganisation || '',
        startDate: formData.startDate || '',
        currentlyWorking: formData.currentlyWorking || false,
        endDate: formData.endDate,
        location: formData.location,
        description: formData.description,
      };
      setRoles([...roles, newRole]);
    }
    handleCloseModal();
  };

  // Simplified update handlers
  const handleUpdateEducation = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    setEducations(prev => prev.map((edu, i) => i === index ? { ...edu, [field]: value } : edu));
  };

  const handleUpdateRole = (index: number, field: keyof RoleEntry, value: string | boolean) => {
    setRoles(prev => prev.map((role, i) => i === index ? { ...role, [field]: value } : role));
  };

  // Picker handlers
  const openDatePicker = (index: number | undefined, field: 'startDate' | 'endDate', context: 'main' | 'modal' = 'main') => {
    let existingDate: Date | null = null;
    if (context === 'main' && index !== undefined) {
      const dateStr = roles[index]?.[field];
      if (dateStr) {
        // Convert DD / MM / YYYY to YYYY-MM-DD
        const parts = dateStr.split(' / ');
        const iso = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
        existingDate = fromLocalISODate(iso);
      }
    } else if (context === 'modal') {
      const dateStr = formData[field];
      if (dateStr) {
        const parts = dateStr.split(' / ');
        const iso = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
        existingDate = fromLocalISODate(iso);
      }
    }
    setPickerState({
      type: 'date',
      context,
      target: { index, field },
      tempDate: existingDate ?? new Date(),
    });
  };

  const openYearPicker = (index: number | undefined, field: 'startYear' | 'endYear', context: 'main' | 'modal' = 'main') => {
    setPickerState({
      type: 'year',
      context,
      target: { index, field },
    });
  };

  const closePicker = () => {
    setPickerState({ type: null, context: 'main', target: null });
  };

  const handleDateSelected = (date: Date) => {
    const { context, target } = pickerState;
    if (!target) return;

    const iso = toLocalISODate(date);
    const displayDate = formatDateDisplay(iso);

    if (context === 'main' && target.index !== undefined) {
      handleUpdateRole(target.index, target.field as 'startDate' | 'endDate', displayDate);
    } else if (context === 'modal') {
      setFormData(prev => ({ ...prev, [target.field]: displayDate }));
    }
    closePicker();
  };

  const handleYearSelected = (year: string) => {
    const { context, target } = pickerState;
    if (!target) return;

    if (context === 'main' && target.index !== undefined) {
      handleUpdateEducation(target.index, target.field as 'startYear' | 'endYear', year);
    } else if (context === 'modal') {
      setFormData(prev => ({ ...prev, [target.field]: year }));
    }
    closePicker();
  };

  const handleRemoveEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const handleRemoveRole = (index: number) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      // Convert educations and roles to backend format
      // Filter out incomplete entries and only include fields with values
      const educationsForBackend = educations
        .filter((edu) => {
          const hasSchool = edu.schoolUniversity?.trim();
          const hasDegree = edu.degreeProgram?.trim();
          const hasStartYear = edu.startYear?.trim();
          return hasSchool && hasDegree && hasStartYear;
        })
        .map((edu) => {
          const mapped: EducationEntry = {
            schoolUniversity: edu.schoolUniversity.trim(),
            degreeProgram: edu.degreeProgram.trim(),
            startYear: edu.startYear.trim(),
            currentlyEnrolled: edu.currentlyEnrolled,
          };
          
          // Only include optional fields if they have values
          if (edu.endYear?.trim()) {
            mapped.endYear = edu.endYear.trim();
          }
          if (edu.grade?.trim()) {
            mapped.grade = edu.grade.trim();
          }
          
          return mapped;
        });

      const rolesForBackend = roles
        .filter((role) => {
          return role.currentRole?.trim() && role.companyOrganisation?.trim() && role.startDate?.trim();
        })
        .map((role) => {
          // Convert display date (DD / MM / YYYY) to backend format (YYYY-MM-DD)
          const convertToBackendDate = (dateStr: string): string => {
            if (!dateStr) return '';
            if (dateStr.includes('-')) return dateStr; // Already in YYYY-MM-DD format
            const parts = dateStr.split(' / ');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
          };

          const mapped: RoleEntry = {
            currentRole: role.currentRole.trim(),
            companyOrganisation: role.companyOrganisation.trim(),
            startDate: convertToBackendDate(role.startDate),
            currentlyWorking: role.currentlyWorking,
          };
          
          if (role.endDate?.trim()) mapped.endDate = convertToBackendDate(role.endDate);
          if (role.location?.trim()) mapped.location = role.location.trim();
          if (role.description?.trim()) mapped.description = role.description.trim();
          
          return mapped;
        });

      await updatePersonalInfo.mutateAsync({
        educations: educationsForBackend,
        roles: rolesForBackend,
      });

      showToast.success('Education & Role updated successfully');
      router.back();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update education & role');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Education & Role</Text>
          <View style={styles.headerSpacer} />
        </View>

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
            {/* Education Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Education</Text>
                <TouchableOpacity onPress={handleAddEducation} style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#AF7DFF" />
                  <Text style={styles.addButtonText}>Add New Education</Text>
                </TouchableOpacity>
              </View>

              {educations.map((education, index) => (
                <View key={index} style={styles.formGroup}>
                  {educations.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveEducation(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}

                  {/* School/University Name */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>School/University Name</Text>
                    <TextInput
                      style={styles.input}
                      value={education.schoolUniversity}
                      onChangeText={(value) => handleUpdateEducation(index, 'schoolUniversity', value)}
                      placeholder="Enter school/university name"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Degree/Program */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Degree/Program</Text>
                    <TextInput
                      style={styles.input}
                      value={education.degreeProgram}
                      onChangeText={(value) => handleUpdateEducation(index, 'degreeProgram', value)}
                      placeholder="Enter degree/program"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Start Year */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Start Year</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.dateInputContainer}
                      onPress={() => openYearPicker(index, 'startYear', 'main')}
                    >
                      <Text style={[styles.dateDisplayText, !education.startYear ? styles.placeholderText : null]}>
                        {education.startYear || 'Select year'}
                      </Text>
                      <View style={styles.calendarIconContainer}>
                        <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Currently Enrolled Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => {
                      const newValue = !education.currentlyEnrolled;
                      handleUpdateEducation(index, 'currentlyEnrolled', newValue);
                      if (newValue) {
                        handleUpdateEducation(index, 'endYear', '');
                      }
                    }}
                  >
                    <View style={[styles.checkbox, education.currentlyEnrolled && styles.checkboxChecked]}>
                      {education.currentlyEnrolled && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Currently Enrolled</Text>
                  </TouchableOpacity>

                  {/* End Year (if not currently enrolled) */}
                  {!education.currentlyEnrolled && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>End Year</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.dateInputContainer}
                        onPress={() => openYearPicker(index, 'endYear', 'main')}
                      >
                        <Text style={[styles.dateDisplayText, !education.endYear ? styles.placeholderText : null]}>
                          {education.endYear || 'Select year'}
                        </Text>
                        <View style={styles.calendarIconContainer}>
                          <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.inputUnderline} />
                    </View>
                  )}

                  {/* Grade (Optional) */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Grade (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={education.grade}
                      onChangeText={(value) => handleUpdateEducation(index, 'grade', value)}
                      placeholder="Enter Grade"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>
                </View>
              ))}
            </View>

            {/* Current Role Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Role</Text>
                <TouchableOpacity onPress={handleAddRole} style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#AF7DFF" />
                  <Text style={styles.addButtonText}>Add New Role</Text>
                </TouchableOpacity>
              </View>

              {roles.map((role, index) => (
                <View key={index} style={styles.formGroup}>
                  {roles.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveRole(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}

                  {/* Current Role/Job Title */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Current Role/Job Title</Text>
                    <TextInput
                      style={styles.input}
                      value={role.currentRole}
                      onChangeText={(value) => handleUpdateRole(index, 'currentRole', value)}
                      placeholder="Enter job title"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Company/Organization */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Company/Organization</Text>
                    <TextInput
                      style={styles.input}
                      value={role.companyOrganisation}
                      onChangeText={(value) => handleUpdateRole(index, 'companyOrganisation', value)}
                      placeholder="Enter company/organization"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Start Date */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.dateInputContainer}
                      onPress={() => openDatePicker(index, 'startDate', 'main')}
                    >
                      <Text style={[styles.dateDisplayText, !role.startDate ? styles.placeholderText : null]}>
                        {role.startDate || 'DD / MM / YYYY'}
                      </Text>
                      <View style={styles.calendarIconContainer}>
                        <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Currently Working Here Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => {
                      const newValue = !role.currentlyWorking;
                      handleUpdateRole(index, 'currentlyWorking', newValue);
                      if (newValue) {
                        handleUpdateRole(index, 'endDate', '');
                      }
                    }}
                  >
                    <View style={[styles.checkbox, role.currentlyWorking && styles.checkboxChecked]}>
                      {role.currentlyWorking && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Currently Working Here</Text>
                  </TouchableOpacity>

                  {/* End Date (if not currently working) */}
                  {!role.currentlyWorking && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>End Date</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.dateInputContainer}
                        onPress={() => openDatePicker(index, 'endDate', 'main')}
                      >
                        <Text style={[styles.dateDisplayText, !role.endDate ? styles.placeholderText : null]}>
                          {role.endDate || 'DD / MM / YYYY'}
                        </Text>
                        <View style={styles.calendarIconContainer}>
                          <Ionicons name="calendar-outline" size={24} color="#4E4C57" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.inputUnderline} />
                    </View>
                  )}

                  {/* Location (Optional) */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Location (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={role.location || ''}
                      onChangeText={(value) => handleUpdateRole(index, 'location', value)}
                      placeholder="Enter location"
                      placeholderTextColor="#999999"
                    />
                    <View style={styles.inputUnderline} />
                  </View>
                </View>
              ))}
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

      {/* Add New Role/Education Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCloseModal}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalType === 'education' ? 'Add New Education' : 'Add New Role'}
                </Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.modalCloseButton}
                >
                  <View style={styles.modalCloseCircle}>
                    <Ionicons name="close" size={20} color="#0D0A1B" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Modal Scrollable Content */}
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {modalType === 'education' ? (
                  <>
                    {/* School/University Name */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>School/University Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.schoolUniversity}
                        onChangeText={(value) => setFormData({ ...formData, schoolUniversity: value })}
                        placeholder="Enter school/university name"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Degree/Program */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Degree/Program</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.degreeProgram}
                        onChangeText={(value) => setFormData({ ...formData, degreeProgram: value })}
                        placeholder="Enter degree/program"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Start Year */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Start Year</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.modalDateInputContainer}
                        onPress={() => openYearPicker(undefined, 'startYear', 'modal')}
                      >
                        <Text style={[styles.modalDateInput, !formData.startYear ? styles.placeholderText : null]}>
                          {formData.startYear || 'Select year'}
                        </Text>
                        <View style={styles.modalCalendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Currently Enrolled Checkbox */}
                    <TouchableOpacity
                      style={styles.modalCheckboxContainer}
                      onPress={() => setFormData({ ...formData, currentlyEnrolled: !formData.currentlyEnrolled })}
                    >
                      <View style={[styles.modalCheckbox, formData.currentlyEnrolled && styles.modalCheckboxChecked]}>
                        {formData.currentlyEnrolled && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.modalCheckboxLabel}>Currently Enrolled</Text>
                    </TouchableOpacity>

                    {/* End Year (if not currently enrolled) */}
                    {!formData.currentlyEnrolled && (
                      <View style={styles.modalFieldContainer}>
                        <Text style={styles.modalLabel}>End Year</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.modalDateInputContainer}
                          onPress={() => openYearPicker(undefined, 'endYear', 'modal')}
                        >
                          <Text style={[styles.modalDateInput, !formData.endYear ? styles.placeholderText : null]}>
                            {formData.endYear || 'Select year'}
                          </Text>
                          <View style={styles.modalCalendarIcon}>
                            <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                          </View>
                        </TouchableOpacity>
                        <View style={styles.modalInputUnderline} />
                      </View>
                    )}

                    {/* Grade (Optional) */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Grade (Optional)</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.grade}
                        onChangeText={(value) => setFormData({ ...formData, grade: value })}
                        placeholder="Enter Grade"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>
                  </>
                ) : (
                  <>
                    {/* Current Role/Job Title */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Current Role/Job Title</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.currentRole}
                        onChangeText={(value) => setFormData({ ...formData, currentRole: value })}
                        placeholder="Enter job title"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Company/Organization */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Company/Organization</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.companyOrganisation}
                        onChangeText={(value) => setFormData({ ...formData, companyOrganisation: value })}
                        placeholder="Enter company/organization"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Start Date */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Start Date</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.modalDateInputContainer}
                        onPress={() => openDatePicker(undefined, 'startDate', 'modal')}
                      >
                        <Text style={[styles.modalDateInput, !formData.startDate ? styles.placeholderText : null]}>
                          {formData.startDate || 'DD / MM / YYYY'}
                        </Text>
                        <View style={styles.modalCalendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </View>
                      </TouchableOpacity>
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Currently Working Here Checkbox */}
                    <TouchableOpacity
                      style={styles.modalCheckboxContainer}
                      onPress={() => setFormData({ ...formData, currentlyWorking: !formData.currentlyWorking })}
                    >
                      <View style={[styles.modalCheckbox, formData.currentlyWorking && styles.modalCheckboxChecked]}>
                        {formData.currentlyWorking && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.modalCheckboxLabel}>Currently Working Here</Text>
                    </TouchableOpacity>

                    {/* End Date (if not currently working) */}
                    {!formData.currentlyWorking && (
                      <View style={styles.modalFieldContainer}>
                        <Text style={styles.modalLabel}>End Date</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.modalDateInputContainer}
                          onPress={() => openDatePicker(undefined, 'endDate', 'modal')}
                        >
                          <Text style={[styles.modalDateInput, !formData.endDate ? styles.placeholderText : null]}>
                            {formData.endDate || 'DD / MM / YYYY'}
                          </Text>
                          <View style={styles.modalCalendarIcon}>
                            <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                          </View>
                        </TouchableOpacity>
                        <View style={styles.modalInputUnderline} />
                      </View>
                    )}

                    {/* Location (Optional) */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Location (Optional)</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={formData.location}
                        onChangeText={(value) => setFormData({ ...formData, location: value })}
                        placeholder="Enter location"
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>

                    {/* Description (Optional) */}
                    <View style={styles.modalFieldContainer}>
                      <Text style={styles.modalLabel}>Description (Optional)</Text>
                      <TextInput
                        style={[styles.modalInput, styles.modalTextArea]}
                        value={formData.description}
                        onChangeText={(value) => setFormData({ ...formData, description: value })}
                        placeholder="Write here..."
                        placeholderTextColor="#999999"
                        multiline
                        textAlignVertical="top"
                      />
                      <View style={styles.modalInputUnderline} />
                    </View>
                  </>
                )}
              </ScrollView>

              {/* Modal Add Button */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalAddButton}
                  onPress={handleModalAdd}
                >
                  <Text style={styles.modalAddButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Unified Date Picker */}
      {pickerState.type === 'date' && pickerState.target && (
        <>
          {Platform.OS === 'android' ? (
            <DateTimePicker
              value={pickerState.tempDate ?? new Date()}
              mode="date"
              maximumDate={new Date()}
              minimumDate={new Date(1950, 0, 1)}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'dismissed') {
                  closePicker();
                  return;
                }
                if (selectedDate) {
                  handleDateSelected(selectedDate);
                }
              }}
            />
          ) : (
            <Modal transparent animationType="slide" visible onRequestClose={closePicker}>
              <Pressable style={styles.pickerBackdrop} onPress={closePicker}>
                <View style={styles.pickerSheet}>
                  <View style={styles.pickerHeaderRow}>
                    <TouchableOpacity onPress={closePicker} activeOpacity={0.7}>
                      <Text style={styles.pickerHeaderButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerHeaderTitle}>Select date</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (pickerState.tempDate) {
                          handleDateSelected(pickerState.tempDate);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerHeaderButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={pickerState.tempDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    minimumDate={new Date(1950, 0, 1)}
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        setPickerState(prev => ({ ...prev, tempDate: selectedDate }));
                      }
                    }}
                  />
                </View>
              </Pressable>
            </Modal>
          )}
        </>
      )}

      {/* Unified Year Picker */}
      {pickerState.type === 'year' && pickerState.target && (
        <Modal
          transparent
          animationType="slide"
          visible
          onRequestClose={closePicker}
        >
          <Pressable style={styles.pickerBackdrop} onPress={closePicker}>
            <View style={[styles.pickerSheet, { paddingBottom: 0 }]}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={closePicker} activeOpacity={0.7}>
                  <Text style={styles.pickerHeaderButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>Select year</Text>
                <View style={{ width: 56 }} />
              </View>
              <ScrollView>
                {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => String(YEAR_MAX - i)).map((year) => {
                  const { context, target } = pickerState;
                  if (!target) return null;
                  let selected = false;
                  if (context === 'main' && target.index !== undefined) {
                    const edu = educations[target.index];
                    selected = edu?.[target.field as 'startYear' | 'endYear'] === year;
                  } else if (context === 'modal') {
                    selected = formData[target.field as 'startYear' | 'endYear'] === year;
                  }
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[styles.countryCodeOption, selected && styles.countryCodeOptionSelected]}
                      activeOpacity={0.7}
                      onPress={() => handleYearSelected(year)}
                    >
                      <Text style={[styles.countryCodeOptionText, selected && styles.countryCodeOptionTextSelected]}>
                        {year}
                      </Text>
                      {selected && <Ionicons name="checkmark" size={20} color="#AF7DFF" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  formGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    padding: 4,
  },
  fieldContainer: {
    marginBottom: 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
    fontFamily: 'Montserrat_400Regular',
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
  calendarIcon: {
    padding: 4,
  },
  calendarIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  inputErrorBorder: {
    borderBottomWidth: 1,
    borderColor: '#FF4444',
  },
  inputErrorText: {
    marginTop: 6,
    color: '#FF4444',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
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
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalFieldContainer: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  modalInput: {
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalTextArea: {
    minHeight: 80,
    paddingTop: 8,
  },
  modalDateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalDateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 6,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalCalendarIcon: {
    padding: 4,
  },
  modalInputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  modalCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCheckboxChecked: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
  modalCheckboxLabel: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  modalAddButton: {
    backgroundColor: '#AF7DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Picker styles
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

