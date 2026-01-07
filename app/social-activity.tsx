import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type NotificationOption = 'everyone' | 'following' | 'off';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
}

const categories: NotificationCategory[] = [
  {
    id: 'likes',
    title: 'Likes',
    description: 'Alex liked your photo.',
  },
  {
    id: 'comments',
    title: 'Comments',
    description: 'Alex commented on your post.',
  },
  {
    id: 'mentions',
    title: 'Mentions / Tags',
    description: 'Alex mentioned you in a post.',
  },
  {
    id: 'followers',
    title: 'New Followers',
    description: 'Alex started following you.',
  },
  {
    id: 'reactions',
    title: 'Reactions to Your Post',
    description: 'Alex reacted to your update.',
  },
];

export default function SocialActivityScreen() {
  const [settings, setSettings] = useState<Record<string, NotificationOption>>({
    likes: 'everyone',
    comments: 'everyone',
    mentions: 'everyone',
    followers: 'everyone',
    reactions: 'everyone',
  });

  const handleOptionChange = (categoryId: string, option: NotificationOption) => {
    setSettings(prev => ({
      ...prev,
      [categoryId]: option,
    }));
  };

  const RadioButton = ({ 
    selected, 
    onPress 
  }: { 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.radioButton}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  const NotificationCategoryItem = ({ category }: { category: NotificationCategory }) => {
    const currentValue = settings[category.id];

    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleOptionChange(category.id, 'everyone')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>From everyone</Text>
            <RadioButton
              selected={currentValue === 'everyone'}
              onPress={() => handleOptionChange(category.id, 'everyone')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleOptionChange(category.id, 'following')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>From people you follow</Text>
            <RadioButton
              selected={currentValue === 'following'}
              onPress={() => handleOptionChange(category.id, 'following')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleOptionChange(category.id, 'off')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>Off</Text>
            <RadioButton
              selected={currentValue === 'off'}
              onPress={() => handleOptionChange(category.id, 'off')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Social Activity</Text>
          </View>
        </View>

        {/* Categories List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {categories.map((category) => (
            <NotificationCategoryItem key={category.id} category={category} />
          ))}
        </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  categoryContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryHeader: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  radioButton: {
    padding: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#AF7DFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AF7DFF',
  },
});

