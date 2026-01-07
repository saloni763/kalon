import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { showToast } from '@/utils/toast';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type SkillItem = {
  id: string;
  name: string;
};

type SkillCategory = {
  id: string;
  name: string;
  items: SkillItem[];
};

// Copied from `app/auth/personal-info.tsx` to keep the same items list.
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
    name: 'Identity & Language',
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

export default function SkillsInterestsScreen() {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(['community', 'craft']));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['popular', 'creativity'])
  );

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
    // TODO: Connect to backend/user profile update when endpoint is ready.
    showToast.success('Skills & interests updated');
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
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
            style={[styles.saveButton, selectedCount === 0 && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={selectedCount === 0}
          >
            <Text style={styles.saveText}>Save</Text>
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


