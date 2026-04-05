import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/theme';
import Header from '../components/common/Header';
import { DAILY_QUOTES } from '../utils/constants';
import { getDailyQuoteIndex } from '../utils/dateUtils';
import { JournalEntry } from '../types/journal';
import JournalRepository from '../services/database/JournalRepository';
import JournalCard from '../components/journal/JournalCard';
import JournalSkeleton from '../components/skeletons/JournalSkeleton';
import type { JournalStackParamList } from '../app/Navigation';

type NavProp = NativeStackNavigationProp<JournalStackParamList>;

export default function JournalScreen() {
  const navigation = useNavigation<NavProp>();
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, []),
  );

  const loadEntries = async () => {
    try {
      const data = await JournalRepository.getRecentEntries(30);
      setEntries(data);
    } catch (err) {
      console.warn('[JournalScreen] Failed to load entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quote = DAILY_QUOTES[getDailyQuoteIndex()]!;

  const renderHeader = () => (
    <>
      {/* Today's Reflection quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteLabel}>TODAY'S REFLECTION</Text>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCircle}>
        <Icon name="notebook-edit-outline" size={36} color="#908981" />
      </View>
      <Text style={styles.emptyHeading}>Your first entry</Text>
      <Text style={styles.emptyDescription}>
        Capture a thought, a feeling, or a moment. Tap the + to begin your
        story.
      </Text>
      <View style={styles.emptyDividerLine} />
      <Text style={styles.emptyBeginLabel}>BEGIN HERE</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Header — consistent with Home */}
      <Header
        title="Journal"
        showBack={false}
        showMenu={false}
        rightElement={
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => navigation.navigate('JournalEntry')}
          >
            <Icon name="plus" size={22} color={colors.primary} />
          </Pressable>
        }
      />

      {/* Entry list */}
      {isLoading ? (
        <JournalSkeleton />
      ) : (
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <JournalCard
            entry={item}
            onPress={() =>
              navigation.navigate('JournalEntry', { entryId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Add button
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2DED6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    backgroundColor: '#F0ECE4',
    transform: [{ scale: 0.95 }],
  },

  // List
  listContent: {
    paddingBottom: 24,
  },

  // Quote card
  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quoteLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#908981',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    color: '#2C2926',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0ECE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C2926',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#908981',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
  },
  emptyDividerLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2DED6',
    marginTop: 8,
  },
  emptyBeginLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#908981',
  },
});
