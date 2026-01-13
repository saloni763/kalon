import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useUpdatePersonalInfo } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import { skillCategories, defaultExpandedCategories, type SkillCategory } from '@/constants/skills';

export default function SkillsInterestsScreen() {
  const user = useUser();
  const updatePersonalInfo = useUpdatePersonalInfo();

  // Initialize selected skills from user data
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    () => new Set(user?.skills || [])
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(defaultExpandedCategories)
  );

  // Update selected skills when user data changes
  useEffect(() => {
    if (user?.skills) {
      setSelectedSkills(new Set(user.skills));
    }
  }, [user?.skills]);

  const selectedCount = useMemo(() => selectedSkills.size, [selectedSkills]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const skillsArray = Array.from(selectedSkills);
      
      await updatePersonalInfo.mutateAsync({
        skills: skillsArray,
      });

      showToast.success('Skills & interests updated');
      router.back();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update skills & interests');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backButtonCircle}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skills & Interests</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                  <View style={styles.expandIcon}>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.tagsContainer}>
                    {category.items.map((item) => {
                      const isSelected = selectedSkills.has(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.tag, isSelected && styles.tagSelected]}
                          onPress={() => toggleSkill(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
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
        </ScrollView>

        {/* Save */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (selectedCount === 0 || updatePersonalInfo.isPending) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={selectedCount === 0 || updatePersonalInfo.isPending}
          >
            <Text style={styles.saveText}>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  categoryContainer: {
    marginBottom: 18,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  expandIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#F5EEFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  tagSelected: {
    backgroundColor: '#AF7DFF',
  },
  tagText: {
    fontSize: 13,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
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
    backgroundColor: '#CFB1FF',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});


