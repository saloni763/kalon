import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTERS_STORAGE_KEY = '@kalon_event_filters';

export interface EventFilters {
  date: string | null; // 'starting-soon' | 'today' | 'tomorrow' | 'next-week' | 'next-weekend' | null
  eventType: {
    private: boolean;
    public: boolean;
  };
  eventMode: string; // 'all' | 'onsite' | 'online'
}

const DEFAULT_FILTERS: EventFilters = {
  date: 'starting-soon',
  eventType: {
    private: true,
    public: true,
  },
  eventMode: 'all',
};

const DATE_OPTIONS = [
  { value: 'starting-soon', label: 'Starting soon' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'next-week', label: 'Next week' },
  { value: 'next-weekend', label: 'Next weekend' },
];

export default function EventFilterScreen() {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);

  // Load existing filters from AsyncStorage on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const storedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (storedFilters) {
          const parsedFilters = JSON.parse(storedFilters);
          setFilters({ ...DEFAULT_FILTERS, ...parsedFilters });
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = async () => {
    // Save filters to AsyncStorage and navigate back
    try {
      await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
      router.back();
    } catch (error) {
      console.error('Error saving filters:', error);
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleDateSelect = (value: string) => {
    setFilters(prev => ({ ...prev, date: value }));
  };

  const handleEventTypeToggle = (type: 'private' | 'public') => {
    setFilters(prev => ({
      ...prev,
      eventType: {
        ...prev.eventType,
        [type]: !prev.eventType[type],
      },
    }));
  };

  const handleEventModeSelect = (mode: string) => {
    setFilters(prev => ({ ...prev, eventMode: mode }));
  };

  // Check if filters are different from default
  const hasActiveFilters = () => {
    return (
      filters.date !== DEFAULT_FILTERS.date ||
      !filters.eventType.private ||
      !filters.eventType.public ||
      filters.eventMode !== DEFAULT_FILTERS.eventMode
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
            <Ionicons name="close-circle" size={26} color="#0D0A1B" />
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
          showsVerticalScrollIndicator={false}
        >
          {/* Dates Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Dates</Text>
            {DATE_OPTIONS.map((option) => {
              const isSelected = filters.date === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => handleDateSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
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

          {/* Event Type Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Event Type</Text>
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => handleEventTypeToggle('private')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, filters.eventType.private && styles.checkboxSelected]}>
                {filters.eventType.private && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.checkboxOptionText, filters.eventType.private && styles.checkboxOptionTextSelected]}>
                Private
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => handleEventTypeToggle('public')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, filters.eventType.public && styles.checkboxSelected]}>
                {filters.eventType.public && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.checkboxOptionText, filters.eventType.public && styles.checkboxOptionTextSelected]}>
                Public
              </Text>
            </TouchableOpacity>
          </View>

          {/* Event Mode Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Event Mode</Text>
            {['all', 'onsite', 'online'].map((mode) => {
              const isSelected = filters.eventMode === mode;
              const label = mode.charAt(0).toUpperCase() + mode.slice(1);
              return (
                <TouchableOpacity
                  key={mode}
                  style={styles.radioOption}
                  onPress={() => handleEventModeSelect(mode)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={[styles.radioOptionText, isSelected && styles.radioOptionTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
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
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9E9E9E',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#AF7DFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AF7DFF',
  },
  radioOptionText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  radioOptionTextSelected: {
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9E9E9E',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
  checkboxOptionText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  checkboxOptionTextSelected: {
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#E8D5FF',
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

