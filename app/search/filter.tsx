import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { skillCategories } from '@/constants/skills';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterState } from '@/components/FilterModal';
import SearchIcon from '@/components/ui/SearchIcon';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import CalendarIcon from '@/assets/icons/calendar.svg';

const FILTERS_STORAGE_KEY = '@kalon_search_filters';
const POST_FILTERS_STORAGE_KEY = '@kalon_post_search_filters';

// Post filter types
interface PostFilterState {
  keywords: string;
  postTypes: string[]; // 'Text' | 'Image' | 'Blogs' | 'Poll'
  dateFrom: string;
  dateTo: string;
  sortBy: 'mostLiked' | 'mostRecent' | null;
}

const DEFAULT_POST_FILTERS: PostFilterState = {
  keywords: '',
  postTypes: [],
  dateFrom: '',
  dateTo: '',
  sortBy: null,
};

const POST_TYPE_OPTIONS = ['Text', 'Image', 'Blogs', 'Poll'];
const SORT_BY_OPTIONS = [
  { value: 'mostLiked', label: 'Most Liked' },
  { value: 'mostRecent', label: 'Most Recent' },
];

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
  'Highschool',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate / PhD',
  'Diploma / Certificate',
];
const JOB_OCCUPATION_OPTIONS = [
  'Student',
  'Software Engineer',
  'Yoga Instructor',
  'Doctor',
  'Entrepreneur',
  'Artist',
  'Retired',
];

const LANGUAGE_OPTIONS = [
  'Eng',
  'Span',
  'Chi',
  'Hin',
  'Ara',
  'Fre',
  'Other',
];

const HEALTH_WELLBEING_OPTIONS = [
  'Fitness',
  'Yoga',
  'Meditation',
  'Nutrition',
  'Mental Health',
  'Wellness',
  'Running',
  'Cycling',
  'Swimming',
];

const COMMUNITY_ENVIRONMENT_OPTIONS = [
  'Social Work',
  'Volunteering',
  'Sustainability',
  'Wildlife',
  'Recycling',
  'Farming',
  'Local Events',
  'Culture',
  'Climate',
];

const CAREER_BUSINESS_OPTIONS = [
  'Design & Creative',
  'Business & Management',
  'Marketing & Sales',
  'Finance & Investment',
  'Education & Training',
  'Healthcare & Wellness',
  'Law & Government',
  'Engineering',
  'Startup',
  'Real Estate',
  'Agriculture',
  'Consulting',
];

const CREATIVITY_OPTIONS = [
  'Design',
  'Dancing',
  'Videography',
  'Craft',
  'Writing',
  'Singing',
  'Photography',
];

const SPORTS_OPTIONS = [
  'Cricket',
  'Basketball',
  'Badminton',
  'Tennis',
  'Table Tennis',
  'Volleyball',
  'Football',
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

// Local state for education level as array (for checkbox multi-select)
type LocalEducationState = string[];

export default function FilterScreen() {
  const params = useLocalSearchParams<{ filters?: string; type?: string }>();
  const filterType = params.type || 'people'; // 'post' or 'people'
  const isPostFilter = filterType === 'post';
  
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [postFilters, setPostFilters] = useState<PostFilterState>(DEFAULT_POST_FILTERS);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [jobOccupationSearch, setJobOccupationSearch] = useState('');
  const [educationLevelSearch, setEducationLevelSearch] = useState('');
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [genderSearch, setGenderSearch] = useState('');
  const [popularInterestsSearch, setPopularInterestsSearch] = useState('');
  const [creativitySearch, setCreativitySearch] = useState('');
  const [sportsSearch, setSportsSearch] = useState('');
  const [careerBusinessSearch, setCareerBusinessSearch] = useState('');
  const [communityEnvironmentSearch, setCommunityEnvironmentSearch] = useState('');
  const [healthWellbeingSearch, setHealthWellbeingSearch] = useState('');
  const [identityLanguageSearch, setIdentityLanguageSearch] = useState('');
  // Local state for education level as array (for checkbox UI)
  const [educationLevels, setEducationLevels] = useState<LocalEducationState>([]);

  // Load filters from storage or params on mount
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      if (isPostFilter) {
        // Load post filters
        const stored = await AsyncStorage.getItem(POST_FILTERS_STORAGE_KEY);
        if (stored) {
          const loadedFilters = { ...DEFAULT_POST_FILTERS, ...JSON.parse(stored) };
          setPostFilters(loadedFilters);
        }
      } else {
        // Load user filters
        if (params.filters) {
          const parsed = JSON.parse(decodeURIComponent(params.filters));
          const loadedFilters = { ...DEFAULT_FILTERS, ...parsed };
          setFilters(loadedFilters);
          // Convert educationLevel string to array for checkbox UI
          if (loadedFilters.educationLevel && typeof loadedFilters.educationLevel === 'string') {
            setEducationLevels([loadedFilters.educationLevel]);
          } else if (Array.isArray(loadedFilters.educationLevel)) {
            setEducationLevels(loadedFilters.educationLevel);
          }
        } else {
          const stored = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
          if (stored) {
            const loadedFilters = { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
            setFilters(loadedFilters);
            // Convert educationLevel string to array for checkbox UI
            if (loadedFilters.educationLevel && typeof loadedFilters.educationLevel === 'string') {
              setEducationLevels([loadedFilters.educationLevel]);
            } else if (Array.isArray(loadedFilters.educationLevel)) {
              setEducationLevels(loadedFilters.educationLevel);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const handleReset = () => {
    if (isPostFilter) {
      setPostFilters(DEFAULT_POST_FILTERS);
    } else {
      setFilters(DEFAULT_FILTERS);
      setEducationLevels([]);
    }
  };

  const handleApply = async () => {
    try {
      if (isPostFilter) {
        // Save post filters
        await AsyncStorage.setItem(POST_FILTERS_STORAGE_KEY, JSON.stringify(postFilters));
      } else {
        // Convert educationLevels array back to string (or keep as array if needed)
        const filtersToSave = {
          ...filters,
          educationLevel: educationLevels.length > 0 ? (educationLevels.length === 1 ? educationLevels[0] : educationLevels) : null,
        };
        // Save filters to storage
        await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
      }
      // Navigate back with filters as params
      router.back();
    } catch (error) {
      console.error('Error saving filters:', error);
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
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
            onLayout={(evt: any) => {
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

  const renderEducationLevelDropdown = () => {
    const isOpen = activeDropdown === 'educationLevel';
    const selectedCount = educationLevels.length;
    const displayText = selectedCount > 0 ? `${selectedCount} selected` : 'Select';

    // Filter options based on search
    const filteredOptions = EDUCATION_OPTIONS.filter(option =>
      option.toLowerCase().includes(educationLevelSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (educationLevels.length === EDUCATION_OPTIONS.length) {
        // Deselect all
        setEducationLevels([]);
      } else {
        // Select all
        setEducationLevels([...EDUCATION_OPTIONS]);
      }
    };

    const handleToggleEducation = (option: string) => {
      setEducationLevels(prev => {
        if (prev.includes(option)) {
          return prev.filter(item => item !== option);
        } else {
          return [...prev, option];
        }
      });
    };

    const isAllSelected = educationLevels.length === EDUCATION_OPTIONS.length;

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Highest Education Level</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'educationLevel');
            if (!isOpen) {
              setEducationLevelSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={educationLevelSearch}
                onChangeText={setEducationLevelSearch}
                autoCapitalize="none"
              />
            </View>

            {/* Options List */}
            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              {/* Select All Option */}
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAllSelected && styles.checkboxFilled]}>
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, isAllSelected && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {/* Education Options */}
              {filteredOptions.map((option, index) => {
                const isSelected = educationLevels.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleToggleEducation(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Generic function for single-select inline card dropdown (radio buttons)
  const renderSingleSelectCard = (
    field: keyof FilterState,
    options: string[],
    label: string,
    searchValue: string,
    setSearchValue: (value: string) => void
  ) => {
    const isOpen = activeDropdown === field;
    const currentValue = filters[field] as string | null;
    const displayText = currentValue || 'Select';

    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentValue) {
        setFilters(prev => ({ ...prev, [field]: null }));
      }
    };

    const handleSelect = (option: string) => {
      setFilters(prev => ({ ...prev, [field]: option }));
      setActiveDropdown(null);
      setSearchValue('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : field);
            if (!isOpen) {
              setSearchValue('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={searchValue}
                onChangeText={setSearchValue}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                  {!currentValue && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Generic function for multi-select inline card dropdown (checkboxes)
  const renderMultiSelectCard = (
    field: keyof FilterState,
    options: string[],
    label: string,
    searchValue: string,
    setSearchValue: (value: string) => void
  ) => {
    const isOpen = activeDropdown === field;
    const currentArray = (filters[field] as string[]) || [];
    const selectedCount = currentArray.length;
    const displayText = selectedCount > 0 ? `${selectedCount} selected` : 'Select';

    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentArray.length === options.length) {
        setFilters(prev => ({ ...prev, [field]: [] }));
      } else {
        setFilters(prev => ({ ...prev, [field]: [...options] }));
      }
    };

    const handleToggle = (option: string) => {
      setFilters(prev => {
        const currentArray = (prev[field] as string[]) || [];
        if (currentArray.includes(option)) {
          return { ...prev, [field]: currentArray.filter(item => item !== option) };
        } else {
          return { ...prev, [field]: [...currentArray, option] };
        }
      });
    };

    const isAllSelected = currentArray.length === options.length;

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : field);
            if (!isOpen) {
              setSearchValue('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={searchValue}
                onChangeText={setSearchValue}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAllSelected && styles.checkboxFilled]}>
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, isAllSelected && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentArray.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleToggle(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderPopularInterestsDropdown = () => {
    const isOpen = activeDropdown === 'popularInterests';
    const currentArray = (filters.popularInterests as string[]) || [];
    const selectedCount = currentArray.length;
    const displayText = selectedCount > 0 ? `${selectedCount} selected` : 'Select';

    const popularOptions = getInterestOptions('popular');
    const filteredOptions = popularOptions.filter(option =>
      option.toLowerCase().includes(popularInterestsSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentArray.length === popularOptions.length) {
        setFilters(prev => ({ ...prev, popularInterests: [] }));
      } else {
        setFilters(prev => ({ ...prev, popularInterests: [...popularOptions] }));
      }
    };

    const handleToggle = (option: string) => {
      setFilters(prev => {
        const currentArray = (prev.popularInterests as string[]) || [];
        if (currentArray.includes(option)) {
          return { ...prev, popularInterests: currentArray.filter(item => item !== option) };
        } else {
          return { ...prev, popularInterests: [...currentArray, option] };
        }
      });
    };

    const isAllSelected = currentArray.length === popularOptions.length;

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Popular Interests</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'popularInterests');
            if (!isOpen) {
              setPopularInterestsSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={popularInterestsSearch}
                onChangeText={setPopularInterestsSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAllSelected && styles.checkboxFilled]}>
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, isAllSelected && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentArray.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleToggle(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCreativityDropdown = () => {
    const isOpen = activeDropdown === 'creativity';
    // Handle both string[] (from FilterState) and single string selection
    const currentArray = (filters.creativity as string[]) || [];
    const currentValue = currentArray.length > 0 ? currentArray[0] : null;
    const displayText = currentValue || 'Select';

    const filteredOptions = CREATIVITY_OPTIONS.filter(option =>
      option.toLowerCase().includes(creativitySearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentValue) {
        setFilters(prev => ({ ...prev, creativity: [] }));
      }
    };

    const handleSelectCreativity = (option: string) => {
      // Store as array for FilterState compatibility, but only allow single selection
      setFilters(prev => ({ ...prev, creativity: [option] }));
      setActiveDropdown(null);
      setCreativitySearch('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Creativity</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'creativity');
            if (!isOpen) {
              setCreativitySearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>

            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={creativitySearch}
                onChangeText={setCreativitySearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                  {!currentValue && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleSelectCreativity(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderSportsDropdown = () => {
    const isOpen = activeDropdown === 'sports';
    const currentArray = (filters.sports as string[]) || [];
    const selectedCount = currentArray.length;
    const displayText = selectedCount > 0 ? `${selectedCount} selected` : 'Select';

    const filteredOptions = SPORTS_OPTIONS.filter(option =>
      option.toLowerCase().includes(sportsSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentArray.length === SPORTS_OPTIONS.length) {
        setFilters(prev => ({ ...prev, sports: [] }));
      } else {
        setFilters(prev => ({ ...prev, sports: [...SPORTS_OPTIONS] }));
      }
    };

    const handleToggle = (option: string) => {
      setFilters(prev => {
        const currentArray = (prev.sports as string[]) || [];
        if (currentArray.includes(option)) {
          return { ...prev, sports: currentArray.filter(item => item !== option) };
        } else {
          return { ...prev, sports: [...currentArray, option] };
        }
      });
    };

    const isAllSelected = currentArray.length === SPORTS_OPTIONS.length;

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Sports</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'sports');
            if (!isOpen) {
              setSportsSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={sportsSearch}
                onChangeText={setSportsSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAllSelected && styles.checkboxFilled]}>
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, isAllSelected && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentArray.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleToggle(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCareerBusinessDropdown = () => {
    const isOpen = activeDropdown === 'careerBusiness';
    // Handle both string[] (from FilterState) and single string selection
    const currentArray = (filters.careerBusiness as string[]) || [];
    const currentValue = currentArray.length > 0 ? currentArray[0] : null;
    const displayText = currentValue || 'Select';

    const filteredOptions = CAREER_BUSINESS_OPTIONS.filter(option =>
      option.toLowerCase().includes(careerBusinessSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentValue) {
        setFilters(prev => ({ ...prev, careerBusiness: [] }));
      }
    };

    const handleSelectCareer = (option: string) => {
      // Store as array for FilterState compatibility, but only allow single selection
      setFilters(prev => ({ ...prev, careerBusiness: [option] }));
      setActiveDropdown(null);
      setCareerBusinessSearch('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Career & Business</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'careerBusiness');
            if (!isOpen) {
              setCareerBusinessSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={careerBusinessSearch}
                onChangeText={setCareerBusinessSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                  {!currentValue && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleSelectCareer(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCommunityEnvironmentDropdown = () => {
    const isOpen = activeDropdown === 'communityEnvironment';
    const currentArray = (filters.communityEnvironment as string[]) || [];
    const selectedCount = currentArray.length;
    const displayText = selectedCount > 0 ? `${selectedCount} selected` : 'Select';

    const filteredOptions = COMMUNITY_ENVIRONMENT_OPTIONS.filter(option =>
      option.toLowerCase().includes(communityEnvironmentSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentArray.length === COMMUNITY_ENVIRONMENT_OPTIONS.length) {
        setFilters(prev => ({ ...prev, communityEnvironment: [] }));
      } else {
        setFilters(prev => ({ ...prev, communityEnvironment: [...COMMUNITY_ENVIRONMENT_OPTIONS] }));
      }
    };

    const handleToggle = (option: string) => {
      setFilters(prev => {
        const currentArray = (prev.communityEnvironment as string[]) || [];
        if (currentArray.includes(option)) {
          return { ...prev, communityEnvironment: currentArray.filter(item => item !== option) };
        } else {
          return { ...prev, communityEnvironment: [...currentArray, option] };
        }
      });
    };

    const isAllSelected = currentArray.length === COMMUNITY_ENVIRONMENT_OPTIONS.length;

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Community & Environment</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'communityEnvironment');
            if (!isOpen) {
              setCommunityEnvironmentSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={communityEnvironmentSearch}
                onChangeText={setCommunityEnvironmentSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAllSelected && styles.checkboxFilled]}>
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, isAllSelected && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentArray.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleToggle(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderHealthWellbeingDropdown = () => {
    const isOpen = activeDropdown === 'healthWellbeing';
    // Handle both string[] (from FilterState) and single string selection
    const currentArray = (filters.healthWellbeing as string[]) || [];
    const currentValue = currentArray.length > 0 ? currentArray[0] : null;
    const displayText = currentValue || 'Select';

    const filteredOptions = HEALTH_WELLBEING_OPTIONS.filter(option =>
      option.toLowerCase().includes(healthWellbeingSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentValue) {
        setFilters(prev => ({ ...prev, healthWellbeing: [] }));
      }
    };

    const handleSelectWellbeing = (option: string) => {
      // Store as array for FilterState compatibility, but only allow single selection
      setFilters(prev => ({ ...prev, healthWellbeing: [option] }));
      setActiveDropdown(null);
      setHealthWellbeingSearch('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Health & Wellbeing</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'healthWellbeing');
            if (!isOpen) {
              setHealthWellbeingSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={healthWellbeingSearch}
                onChangeText={setHealthWellbeingSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                  {!currentValue && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleSelectWellbeing(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderIdentityLanguageDropdown = () => {
    const isOpen = activeDropdown === 'identityLanguage';
    // Handle both string[] (from FilterState) and single string selection
    const currentArray = (filters.identityLanguage as string[]) || [];
    const currentValue = currentArray.length > 0 ? currentArray[0] : null;
    const displayText = currentValue || 'Select';

    const filteredOptions = LANGUAGE_OPTIONS.filter(option =>
      option.toLowerCase().includes(identityLanguageSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      if (currentValue) {
        setFilters(prev => ({ ...prev, identityLanguage: [] }));
      }
    };

    const handleSelectLanguage = (option: string) => {
      // Store as array for FilterState compatibility, but only allow single selection
      setFilters(prev => ({ ...prev, identityLanguage: [option] }));
      setActiveDropdown(null);
      setIdentityLanguageSearch('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Identity & Language</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'identityLanguage');
            if (!isOpen) {
              setIdentityLanguageSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={identityLanguageSearch}
                onChangeText={setIdentityLanguageSearch}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.jobOptionItem}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                  {!currentValue && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {filteredOptions.map((option, index) => {
                const isSelected = currentValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.jobOptionItem,
                      index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                    ]}
                    onPress={() => handleSelectLanguage(option)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Date formatting helpers
  const formatDateDisplay = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day} / ${month} / ${year}`;
  };

  const parseDateFromDisplay = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const parts = dateString.split(' / ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = 2000 + parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } catch {
      return null;
    }
    return null;
  };

  // Date picker handlers
  const openDatePicker = (field: 'from' | 'to') => {
    const currentDateString = field === 'from' ? postFilters.dateFrom : postFilters.dateTo;
    const existingDate = parseDateFromDisplay(currentDateString);
    setTempDate(existingDate || new Date());
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate && activeDateField) {
        const formattedDate = formatDateDisplay(selectedDate);
        setPostFilters(prev => ({
          ...prev,
          [activeDateField === 'from' ? 'dateFrom' : 'dateTo']: formattedDate,
        }));
        setActiveDateField(null);
      } else {
        setActiveDateField(null);
      }
    } else {
      // iOS - update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDateConfirm = () => {
    if (activeDateField) {
      const formattedDate = formatDateDisplay(tempDate);
      setPostFilters(prev => ({
        ...prev,
        [activeDateField === 'from' ? 'dateFrom' : 'dateTo']: formattedDate,
      }));
    }
    setShowDatePicker(false);
    setActiveDateField(null);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setActiveDateField(null);
  };

  const handlePostTypeToggle = (type: string) => {
    setPostFilters(prev => {
      const currentTypes = prev.postTypes || [];
      if (currentTypes.includes(type)) {
        return { ...prev, postTypes: currentTypes.filter(t => t !== type) };
      } else {
        return { ...prev, postTypes: [...currentTypes, type] };
      }
    });
  };

  const handleSortBySelect = (value: 'mostLiked' | 'mostRecent') => {
    setPostFilters(prev => ({
      ...prev,
      sortBy: prev.sortBy === value ? null : value,
    }));
  };

  const renderPostFilters = () => {
    return (
      <>
        {/* Keywords / Hashtags */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Keywords / Hashtags</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter keywords or hashtags"
            placeholderTextColor="#4E4C57"
            value={postFilters.keywords}
            onChangeText={text => setPostFilters(prev => ({ ...prev, keywords: text }))}
          />
        </View>

        {/* Post Type */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Post Type</Text>
          {POST_TYPE_OPTIONS.map((type) => {
            const isSelected = postFilters.postTypes.includes(type);
            return (
              <TouchableOpacity
                key={type}
                style={styles.checkboxOption}
                onPress={() => handlePostTypeToggle(type)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxFilled]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.checkboxOptionText, isSelected && styles.checkboxOptionTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date Range */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>From</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openDatePicker('from')}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateInput, !postFilters.dateFrom && styles.dateInputPlaceholder]}>
                  {postFilters.dateFrom || 'DD / MM / YY'}
                </Text>
                <View style={styles.calendarIconButton}>
                  <CalendarIcon width={20} height={20} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>To</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openDatePicker('to')}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateInput, !postFilters.dateTo && styles.dateInputPlaceholder]}>
                  {postFilters.dateTo || 'DD / MM / YY'}
                </Text>
                <View style={styles.calendarIconButton}>
                  <CalendarIcon width={20} height={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Sort By</Text>
          {SORT_BY_OPTIONS.map((option) => {
            const isSelected = postFilters.sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleSortBySelect(option.value as 'mostLiked' | 'mostRecent')}
                activeOpacity={0.7}
              >
                <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                  {isSelected && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[styles.radioOptionText, isSelected && styles.radioOptionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  };

  const renderJobOccupationDropdown = () => {
    const isOpen = activeDropdown === 'jobOccupation';
    const currentValue = filters.jobOccupation;
    const displayText = currentValue || 'Select';

    // Filter options based on search
    const filteredOptions = JOB_OCCUPATION_OPTIONS.filter(option =>
      option.toLowerCase().includes(jobOccupationSearch.toLowerCase())
    );

    const handleSelectAll = () => {
      // For single select, "Select All" clears the selection (shows as unselected)
      if (currentValue) {
        setFilters(prev => ({ ...prev, jobOccupation: null }));
      }
      // Don't close dropdown when selecting "Select All"
    };

    const handleSelectJob = (option: string) => {
      setFilters(prev => ({ ...prev, jobOccupation: option }));
      setActiveDropdown(null);
      setJobOccupationSearch('');
    };

    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Job Occupation</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => {
            setActiveDropdown(isOpen ? null : 'jobOccupation');
            if (!isOpen) {
              setJobOccupationSearch('');
            }
          }}
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
          <View style={styles.jobOccupationCard}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#4E4C57"
                value={jobOccupationSearch}
                onChangeText={setJobOccupationSearch}
                autoCapitalize="none"
              />
            </View>

            {/* Options List */}
            <ScrollView style={styles.jobOptionsList} nestedScrollEnabled>
               {/* Select All Option */}
               <TouchableOpacity
                 style={styles.jobOptionItem}
                 onPress={handleSelectAll}
                 activeOpacity={0.7}
               >
                 <View style={[styles.radioButton, !currentValue && styles.radioButtonFilled]}>
                   {!currentValue && (
                     <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                   )}
                 </View>
                 <Text style={[styles.jobOptionText, !currentValue && styles.jobOptionTextSelected]}>
                   Select All
                 </Text>
               </TouchableOpacity>

               {/* Job Options */}
               {filteredOptions.map((option, index) => {
                 const isSelected = currentValue === option;
                 return (
                   <TouchableOpacity
                     key={option}
                     style={[
                       styles.jobOptionItem,
                       index === filteredOptions.length - 1 && styles.jobOptionItemLast,
                     ]}
                     onPress={() => handleSelectJob(option)}
                     activeOpacity={0.7}
                   >
                     <View style={[styles.radioButton, isSelected && styles.radioButtonFilled]}>
                       {isSelected && (
                         <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                       )}
                     </View>
                     <Text style={[styles.jobOptionText, isSelected && styles.jobOptionTextSelected]}>
                       {option}
                     </Text>
                   </TouchableOpacity>
                 );
               })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <View style={styles.closeButtonCircle}>
              <Ionicons name="close" size={20} color="#0D0A1B" />
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
          {isPostFilter ? (
            // Post Filters
            renderPostFilters()
          ) : (
            // User Filters
            <>
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
            renderSingleSelectCard('nationality', NATIONALITY_OPTIONS, 'Nationality', nationalitySearch, setNationalitySearch)
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
          {renderSingleSelectCard('gender', GENDER_OPTIONS, 'Gender', genderSearch, setGenderSearch)}

          {/* Highest Education Level */}
          {renderEducationLevelDropdown()}

          {/* Job Occupation */}
          {renderJobOccupationDropdown()}

          {/* Interests Section */}
          <Text style={styles.sectionHeader}>Interests</Text>

          {/* Popular Interests */}
          {renderPopularInterestsDropdown()}

          {/* Creativity */}
          {renderCreativityDropdown()}

          {/* Sports */}
          {renderSportsDropdown()}

          {/* Career & Business */}
          {renderCareerBusinessDropdown()}

          {/* Community & Environment */}
          {renderCommunityEnvironmentDropdown()}

          {/* Health & Wellbeing */}
          {renderHealthWellbeingDropdown()}

          {/* Identity & Language */}
          {renderIdentityLanguageDropdown()}
          </>
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
      </SafeAreaView>

      {/* Date Picker Modal (iOS) */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={handleDateCancel}
        >
          <Pressable style={styles.pickerBackdrop} onPress={handleDateCancel}>
            <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.pickerHeaderRow}>
                <TouchableOpacity onPress={handleDateCancel} activeOpacity={0.7}>
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
                onChange={handleDateChange}
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
          display="default"
          onChange={handleDateChange}
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
  closeButtonCircle: {
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
    color: '#AF7DFF',
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
  jobOccupationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 300,
    overflow: 'hidden',
  },
  referenceBanner: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  referenceBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
  },
  jobOptionsList: {
    maxHeight: 250,
  },
  jobOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  jobOptionItemLast: {
    borderBottomWidth: 0,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonFilled: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#9E9E9E',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxFilled: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
    borderRadius: 12,
  },
  jobOptionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  jobOptionTextSelected: {
    color: '#7436D7',
    fontFamily: 'Montserrat_500Medium',
  },
  // Post filter styles
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxOptionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  checkboxOptionTextSelected: {
    color: '#7436D7',
    fontFamily: 'Montserrat_500Medium',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    minHeight: 48,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
  },
  dateInputPlaceholder: {
    color: '#4E4C57',
  },
  calendarIconButton: {
    padding: 4,
  },
  // Date picker modal styles
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOptionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  radioOptionTextSelected: {
    color: '#7436D7',
    fontFamily: 'Montserrat_500Medium',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

