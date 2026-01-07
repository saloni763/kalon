import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>Your conversations will appear here...</Text>
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
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4E4C57',
  },
});

