import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useUser } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

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

export default function EducationRoleScreen() {
  const user = useUser();

  const [educations, setEducations] = useState<EducationEntry[]>([
    {
      schoolUniversity: 'University of California',
      degreeProgram: 'B.Sc. Computer Science',
      startYear: '2024',
      currentlyEnrolled: true,
      grade: '',
    },
  ]);

  const [roles, setRoles] = useState<RoleEntry[]>([
    {
      currentRole: 'Senior UX Designer',
      companyOrganisation: 'Adobe Inc.',
      startDate: '10 / 03 / 2018',
      currentlyWorking: true,
      location: 'New York',
    },
  ]);

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

  const handleUpdateEducation = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleUpdateRole = (index: number, field: keyof RoleEntry, value: string | boolean) => {
    const updated = [...roles];
    updated[index] = { ...updated[index], [field]: value };
    setRoles(updated);
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
      // TODO: Implement API call to save education and role data
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
                    <View style={styles.dateInputContainer}>
                      <TextInput
                        style={styles.dateInput}
                        value={education.startYear}
                        onChangeText={(value) => handleUpdateEducation(index, 'startYear', value)}
                        placeholder="2024"
                        placeholderTextColor="#999999"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity style={styles.calendarIcon}>
                        <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Currently Enrolled Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleUpdateEducation(index, 'currentlyEnrolled', !education.currentlyEnrolled)}
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
                      <View style={styles.dateInputContainer}>
                        <TextInput
                          style={styles.dateInput}
                          value={education.endYear || ''}
                          onChangeText={(value) => handleUpdateEducation(index, 'endYear', value)}
                          placeholder="Enter end year"
                          placeholderTextColor="#999999"
                          keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.calendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </TouchableOpacity>
                      </View>
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
                    <View style={styles.dateInputContainer}>
                      <TextInput
                        style={styles.dateInput}
                        value={role.startDate}
                        onChangeText={(value) => handleUpdateRole(index, 'startDate', value)}
                        placeholder="10 / 03 / 2018"
                        placeholderTextColor="#999999"
                      />
                      <TouchableOpacity style={styles.calendarIcon}>
                        <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputUnderline} />
                  </View>

                  {/* Currently Working Here Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleUpdateRole(index, 'currentlyWorking', !role.currentlyWorking)}
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
                      <View style={styles.dateInputContainer}>
                        <TextInput
                          style={styles.dateInput}
                          value={role.endDate || ''}
                          onChangeText={(value) => handleUpdateRole(index, 'endDate', value)}
                          placeholder="Enter end date"
                          placeholderTextColor="#999999"
                        />
                        <TouchableOpacity style={styles.calendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputUnderline} />
                    </View>
                  )}

                  {/* Location (Optional) */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Location (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={role.location}
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
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
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
                      <View style={styles.modalDateInputContainer}>
                        <TextInput
                          style={styles.modalDateInput}
                          value={formData.startYear}
                          onChangeText={(value) => setFormData({ ...formData, startYear: value })}
                          placeholder="2024"
                          placeholderTextColor="#999999"
                          keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.modalCalendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </TouchableOpacity>
                      </View>
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
                        <View style={styles.modalDateInputContainer}>
                          <TextInput
                            style={styles.modalDateInput}
                            value={formData.endYear || ''}
                            onChangeText={(value) => setFormData({ ...formData, endYear: value })}
                            placeholder="Enter end year"
                            placeholderTextColor="#999999"
                            keyboardType="numeric"
                          />
                          <TouchableOpacity style={styles.modalCalendarIcon}>
                            <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                          </TouchableOpacity>
                        </View>
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
                      <View style={styles.modalDateInputContainer}>
                        <TextInput
                          style={styles.modalDateInput}
                          value={formData.startDate}
                          onChangeText={(value) => setFormData({ ...formData, startDate: value })}
                          placeholder="20 / 01 / 2016"
                          placeholderTextColor="#999999"
                        />
                        <TouchableOpacity style={styles.modalCalendarIcon}>
                          <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                        </TouchableOpacity>
                      </View>
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
                        <View style={styles.modalDateInputContainer}>
                          <TextInput
                            style={styles.modalDateInput}
                            value={formData.endDate || ''}
                            onChangeText={(value) => setFormData({ ...formData, endDate: value })}
                            placeholder="26 / 01 / 2018"
                            placeholderTextColor="#999999"
                          />
                          <TouchableOpacity style={styles.modalCalendarIcon}>
                            <Ionicons name="calendar-outline" size={20} color="#4E4C57" />
                          </TouchableOpacity>
                        </View>
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
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
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
  },
  modalDateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    paddingVertical: 8,
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
});

