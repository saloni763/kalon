import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { skillCategories } from '@/constants/skills';

export interface FilterState {
  nationality: string | null;
  city: string;
  majorDepartment: string;
  ageRange: { min: number; max: number };
  gender: string | null;
  educationLevel: string | null;
  jobOccupation: string | null;
  popularInterests: string[];
  creativity: string[];
  sports: string[];
  careerBusiness: string[];
  communityEnvironment: string[];
  healthWellbeing: string[];
  identityLanguage: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const NATIONALITY_OPTIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'China',
  'Japan',
  'Germany',
  'France',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'South Korea',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Belgium',
  'Austria',
  'Poland',
  'Portugal',
  'Greece',
  'Ireland',
  'New Zealand',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Philippines',
  'Indonesia',
  'Vietnam',
  'South Africa',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Argentina',
  'Chile',
  'Colombia',
  'Other',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EDUCATION_OPTIONS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate',
  'Professional Degree',
];
const JOB_OCCUPATION_OPTIONS = [
  'Student',
  'Engineer',
  'Teacher',
  'Doctor',
  'Designer',
  'Developer',
  'Manager',
  'Entrepreneur',
  'Artist',
  'Other',
];

const DEFAULT_FILTERS: FilterState = {
  nationality: null,
  city: '',
  majorDepartment: '',
  ageRange: { min: 13, max: 70 },
  gender: null,
  educationLevel: null,
  jobOccupation: null,
  popularInterests: [],
  creativity: [],
  sports: [],
  careerBusiness: [],
  communityEnvironment: [],
  healthWellbeing: [],
  identityLanguage: [],
};

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleNationalityRemove = () => {
    setFilters(prev => ({ ...prev, nationality: null }));
  };

  const handleAgeChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => {
      const newRange = { ...prev.ageRange, [type]: value };
      // Ensure min <= max
      if (type === 'min' && newRange.min > newRange.max) {
        newRange.max = newRange.min;
      } else if (type === 'max' && newRange.max < newRange.min) {
        newRange.min = newRange.max;
      }
      return { ...prev, ageRange: newRange };
    });
  };

  const handleSelectOption = (field: keyof FilterState, value: string) => {
    if (field === 'gender' || field === 'educationLevel' || field === 'jobOccupation') {
      setFilters(prev => ({ ...prev, [field]: value }));
    } else if (
      field === 'popularInterests' ||
      field === 'creativity' ||
      field === 'sports' ||
      field === 'careerBusiness' ||
      field === 'communityEnvironment' ||
      field === 'healthWellbeing' ||
      field === 'identityLanguage'
    ) {
      setFilters(prev => {
        const currentArray = prev[field] as string[];
        const isSelected = currentArray.includes(value);
        return {
          ...prev,
          [field]: isSelected
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value],
        };
      });
    }
    setActiveDropdown(null);
  };

  const renderDropdown = (
    field: keyof FilterState,
    options: string[],
    label: string,
    isMultiSelect = false,
    showAsTag = false
  ) => {
    const isOpen = activeDropdown === field;
    const currentValue = filters[field];

    let displayText = 'Select';
    if (isMultiSelect && Array.isArray(currentValue) && currentValue.length > 0) {
      displayText = `${currentValue.length} selected`;
    } else if (!isMultiSelect && typeof currentValue === 'string' && currentValue) {
      displayText = currentValue;
    }

    // Special handling for nationality with tag display
    if (showAsTag && currentValue && typeof currentValue === 'string') {
      return (
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>{label}</Text>
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>{currentValue}</Text>
            <TouchableOpacity
              onPress={() => {
                if (field === 'nationality') {
                  handleNationalityRemove();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.removeIcon}>
                <Ionicons name="remove-circle" size={20} color="#7436D7" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => setActiveDropdown(isOpen ? null : field)}
          activeOpacity={0.7}
        >
          <Text style={[styles.selectText, displayText !== 'Select' && styles.selectTextSelected]}>
            {displayText}
          </Text>
          <View style={styles.selectIcon}>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#7436D7"
            />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setActiveDropdown(null)}
          >
            <Pressable
              style={styles.dropdownBackdrop}
              onPress={() => setActiveDropdown(null)}
            >
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {options.map((option, index) => {
                    const isSelected = isMultiSelect
                      ? (currentValue as string[]).includes(option)
                      : currentValue === option;

                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.dropdownOption,
                          index === options.length - 1 && styles.dropdownOptionLast,
                          isSelected && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => handleSelectOption(field, option)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            isSelected && styles.dropdownOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color="#7436D7" />
                        )}
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
  };

  const sliderTrackRef = useRef<View>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [draggingHandle, setDraggingHandle] = useState<'min' | 'max' | null>(null);

  const calculateAgeFromPosition = (x: number) => {
    if (sliderWidth === 0) return 13;
    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    return Math.round(13 + percentage * 57);
  };

  const panResponderMin = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingHandle('min');
      },
      onPanResponderMove: (evt) => {
        if (sliderTrackRef.current) {
          sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const newAge = calculateAgeFromPosition(touchX);
            if (newAge <= filters.ageRange.max) {
              handleAgeChange('min', newAge);
            }
          });
        }
      },
      onPanResponderRelease: () => {
        setDraggingHandle(null);
      },
    })
  ).current;

  const panResponderMax = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingHandle('max');
      },
      onPanResponderMove: (evt) => {
        if (sliderTrackRef.current) {
          sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const newAge = calculateAgeFromPosition(touchX);
            if (newAge >= filters.ageRange.min) {
              handleAgeChange('max', newAge);
            }
          });
        }
      },
      onPanResponderRelease: () => {
        setDraggingHandle(null);
      },
    })
  ).current;

  const handleTrackPress = (evt: any) => {
    if (sliderTrackRef.current && !draggingHandle) {
      sliderTrackRef.current.measure((x, y, width, height, pageX, pageY) => {
        const touchX = evt.nativeEvent.pageX - pageX;
        const newAge = calculateAgeFromPosition(touchX);
        const minDist = Math.abs(newAge - filters.ageRange.min);
        const maxDist = Math.abs(newAge - filters.ageRange.max);
        
        if (minDist < maxDist) {
          if (newAge <= filters.ageRange.max) {
            handleAgeChange('min', newAge);
          }
        } else {
          if (newAge >= filters.ageRange.min) {
            handleAgeChange('max', newAge);
          }
        }
      });
    }
  };

  const renderAgeSlider = () => {
    const minPercentage = ((filters.ageRange.min - 13) / 57) * 100;
    const maxPercentage = ((filters.ageRange.max - 13) / 57) * 100;
    
    return (
      <View style={styles.filterItem}>
        <View style={styles.ageRangeHeader}>
          <Ionicons name="person-outline" size={18} color="#7436D7" />
          <Text style={styles.filterLabel}>Age Range</Text>
        </View>
        <View style={styles.ageSliderContainer}>
          <Pressable
            ref={sliderTrackRef}
            onLayout={(evt) => {
              setSliderWidth(evt.nativeEvent.layout.width);
            }}
            onPress={handleTrackPress}
            style={styles.ageSliderTrack}
          >
            <View
              style={[
                styles.ageSliderFill,
                {
                  left: `${minPercentage}%`,
                  width: `${maxPercentage - minPercentage}%`,
                },
              ]}
            />
            <View
              style={[
                styles.ageSliderHandle,
                { left: `${minPercentage}%` },
                draggingHandle === 'min' && styles.ageSliderHandleActive,
              ]}
              {...panResponderMin.panHandlers}
            />
            <View
              style={[
                styles.ageSliderHandle,
                { left: `${maxPercentage}%` },
                draggingHandle === 'max' && styles.ageSliderHandleActive,
              ]}
              {...panResponderMax.panHandlers}
            />
          </Pressable>
          <View style={styles.ageRangeLabels}>
            <Text style={styles.ageRangeLabel}>13</Text>
            <Text style={styles.ageRangeLabel}>70+</Text>
          </View>
          <View style={styles.ageRangeValues}>
            <Text style={styles.ageRangeValue}>{filters.ageRange.min}</Text>
            <Text style={styles.ageRangeValue}>{filters.ageRange.max === 70 ? '70+' : filters.ageRange.max}</Text>
          </View>
        </View>
        <View style={styles.ageInputsContainer}>
          <View style={styles.ageInputWrapper}>
            <Text style={styles.ageInputLabel}>Min</Text>
            <TextInput
              style={styles.ageInput}
              value={filters.ageRange.min.toString()}
              onChangeText={text => {
                const num = parseInt(text) || 13;
                handleAgeChange('min', Math.max(13, Math.min(70, num)));
              }}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.ageInputWrapper}>
            <Text style={styles.ageInputLabel}>Max</Text>
            <TextInput
              style={styles.ageInput}
              value={filters.ageRange.max === 70 ? '70+' : filters.ageRange.max.toString()}
              onChangeText={text => {
                const num = parseInt(text.replace('+', '')) || 70;
                handleAgeChange('max', Math.max(13, Math.min(70, num)));
              }}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>
    );
  };

  const getInterestOptions = (categoryId: string) => {
    const category = skillCategories.find(cat => cat.id === categoryId);
    return category?.items.map(item => item.name) || [];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <View style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {/* Nationality */}
            {filters.nationality ? (
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Nationality</Text>
                <View style={styles.selectedTag}>
                  <Text style={styles.selectedTagText}>{filters.nationality}</Text>
                  <TouchableOpacity
                    onPress={handleNationalityRemove}
                    activeOpacity={0.7}
                  >
                    <View style={styles.removeIcon}>
                      <Ionicons name="remove-circle" size={20} color="#7436D7" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              renderDropdown('nationality', NATIONALITY_OPTIONS, 'Nationality', false, false)
            )}

            {/* Nationality Dropdown */}
            {activeDropdown === 'nationality' && !filters.nationality && (
              <Modal
                visible={activeDropdown === 'nationality'}
                transparent
                animationType="fade"
                onRequestClose={() => setActiveDropdown(null)}
              >
                <Pressable
                  style={styles.dropdownBackdrop}
                  onPress={() => setActiveDropdown(null)}
                >
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {NATIONALITY_OPTIONS.map((option, index) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownOption,
                            index === NATIONALITY_OPTIONS.length - 1 && styles.dropdownOptionLast,
                            filters.nationality === option && styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setFilters(prev => ({ ...prev, nationality: option }));
                            setActiveDropdown(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              filters.nationality === option && styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                          {filters.nationality === option && (
                            <Ionicons name="checkmark" size={20} color="#7436D7" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </Pressable>
              </Modal>
            )}

            {/* City */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter city"
                placeholderTextColor="#4E4C57"
                value={filters.city}
                onChangeText={text => setFilters(prev => ({ ...prev, city: text }))}
              />
            </View>

            {/* Major / Department */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Major / Department</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter major or department"
                placeholderTextColor="#4E4C57"
                value={filters.majorDepartment}
                onChangeText={text =>
                  setFilters(prev => ({ ...prev, majorDepartment: text }))
                }
              />
            </View>

            {/* Basic Info Section */}
            <Text style={styles.sectionHeader}>Basic Info Section</Text>

            {/* Age Range */}
            {renderAgeSlider()}

            {/* Gender */}
            {renderDropdown('gender', GENDER_OPTIONS, 'Gender')}

            {/* Highest Education Level */}
            {renderDropdown('educationLevel', EDUCATION_OPTIONS, 'Highest Education Level')}

            {/* Job Occupation */}
            {renderDropdown('jobOccupation', JOB_OCCUPATION_OPTIONS, 'Job Occupation')}

            {/* Interests Section */}
            <Text style={styles.sectionHeader}>Interests</Text>

            {/* Popular Interests */}
            {renderDropdown(
              'popularInterests',
              getInterestOptions('popular'),
              'Popular Interests',
              true
            )}

            {/* Creativity */}
            {renderDropdown(
              'creativity',
              getInterestOptions('creativity'),
              'Creativity',
              true
            )}

            {/* Sports */}
            {renderDropdown('sports', getInterestOptions('sports'), 'Sports', true)}

            {/* Career & Business */}
            {renderDropdown(
              'careerBusiness',
              getInterestOptions('career'),
              'Career & Business',
              true
            )}

            {/* Community & Environment */}
            {renderDropdown(
              'communityEnvironment',
              getInterestOptions('community-env'),
              'Community & Environment',
              true
            )}

            {/* Health & Wellbeing */}
            {renderDropdown(
              'healthWellbeing',
              getInterestOptions('health'),
              'Health & Wellbeing',
              true
            )}

            {/* Identity & Language */}
            {renderDropdown(
              'identityLanguage',
              getInterestOptions('identity'),
              'Identity & Language',
              true
            )}
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7436D7',
    fontFamily: 'Montserrat_500Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  filterItem: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  selectTextSelected: {
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  selectIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  selectedTagText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  removeIcon: {
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  ageRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ageSliderContainer: {
    marginBottom: 12,
  },
  ageSliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
    width: '100%',
  },
  ageSliderFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#7436D7',
    borderRadius: 2,
  },
  ageSliderHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7436D7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    top: -8,
    marginLeft: -10,
    zIndex: 10,
  },
  ageSliderHandleActive: {
    transform: [{ scale: 1.2 }],
  },
  ageRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ageRangeLabel: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  ageRangeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ageRangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7436D7',
    fontFamily: 'Montserrat_600SemiBold',
  },
  ageInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  ageInputWrapper: {
    flex: 1,
  },
  ageInputLabel: {
    fontSize: 12,
    color: '#4E4C57',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  ageInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingTop: 12,
  },
  dropdownScroll: {
    maxHeight: '100%',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F5EEFF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  dropdownOptionTextSelected: {
    color: '#7436D7',
    fontFamily: 'Montserrat_600SemiBold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#7436D7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

