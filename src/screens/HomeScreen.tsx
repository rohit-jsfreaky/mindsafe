import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/theme';
import { getGreeting } from '../utils/dateUtils';
import { DAILY_QUOTES } from '../utils/constants';
import { getDailyQuoteIndex } from '../utils/dateUtils';
import { useAppStore } from '../store/useAppStore';
import { useMoodStore } from '../store/useMoodStore';
import { MoodLevel } from '../types/mood';
import MoodRepository from '../services/database/MoodRepository';
import ChatRepository from '../services/database/ChatRepository';
import DatabaseService from '../services/database/DatabaseService';
import Header from '../components/common/Header';
import MoodSelector from '../components/mood/MoodSelector';
import MoodChart from '../components/mood/MoodChart';
import ActionCard from '../components/home/ActionCard';
import PrivacyBadge from '../components/common/PrivacyBadge';
import HomeSkeleton from '../components/skeletons/HomeSkeleton';
import AppTour from '../components/common/AppTour';

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const userName = useAppStore((s) => s.userName);
  const { todaysMoods, weeklyData, latestMood, setTodaysMoods, setWeeklyData, addMoodEntry } =
    useMoodStore();
  const [lastConvoSubtitle, setLastConvoSubtitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Check if tour should auto-show on first visit
  useEffect(() => {
    if (!isLoading) {
      (async () => {
        const tourSeen = await DatabaseService.getSetting('tour_completed');
        if (!tourSeen) {
          setTimeout(() => setShowTour(true), 600);
        }
      })();
    }
  }, [isLoading]);

  const handleTourComplete = async () => {
    setShowTour(false);
    await DatabaseService.setSetting('tour_completed', 'true');
  };

  const loadData = useCallback(async () => {
    try {
      const [todays, weekly] = await Promise.all([
        MoodRepository.getTodaysMoods(),
        MoodRepository.getWeeklyData(),
      ]);
      setTodaysMoods(todays);
      setWeeklyData(weekly);

      const lastConvo = await ChatRepository.getLatestConversation();
      if (lastConvo?.lastMessage) {
        setLastConvoSubtitle(
          lastConvo.lastMessage.length > 45
            ? lastConvo.lastMessage.slice(0, 45) + '...'
            : lastConvo.lastMessage,
        );
      }
    } catch (err) {
      console.warn('[HomeScreen] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleMoodSelect = async (level: MoodLevel) => {
    try {
      const emojis = ['', '😣', '😞', '😐', '🙂', '😄'];
      const entry = await MoodRepository.logMood(level, emojis[level]!);
      addMoodEntry(entry);
      // Refresh both today's moods and weekly data
      const [todays, weekly] = await Promise.all([
        MoodRepository.getTodaysMoods(),
        MoodRepository.getWeeklyData(),
      ]);
      setTodaysMoods(todays);
      setWeeklyData(weekly);
    } catch (err) {
      console.warn('[HomeScreen] Failed to log mood:', err);
    }
  };

  const greeting = getGreeting();

  const JOURNAL_PROMPTS = [
    'What brought you peace this week?',
    'What are you grateful for today?',
    'What challenged you recently and what did you learn?',
    'Describe a moment that made you smile today.',
    'What would you tell your future self right now?',
  ];
  const todaysPrompt = JOURNAL_PROMPTS[getDailyQuoteIndex() % JOURNAL_PROMPTS.length]!;

  return (
    <View style={styles.screen}>
      <Header
        showBack={false}
        menuIcon="cog-outline"
        onMenu={() => navigation.navigate('Settings' as any)}
        rightElement={
          <Pressable
            onPress={() => setShowTour(true)}
            hitSlop={12}
            style={{ padding: 4 }}
          >
            <Icon name="help-circle-outline" size={22} color={colors.primary} />
          </Pressable>
        }
      />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeSkeleton />
        </ScrollView>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{userName || 'there'}</Text>
        </View>

        {/* Mood Selector */}
        <View style={styles.moodSection}>
          <MoodSelector
            selected={latestMood}
            onSelect={handleMoodSelect}
          />
        </View>

        {/* Weekly Mood Chart */}
        <View style={styles.chartSection}>
          <MoodChart data={weeklyData} />
          {weeklyData.every((d) => d.levels.length === 0) && (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintText}>
                START YOUR FIRST DAY TO SEE YOUR PROGRESS
              </Text>
            </View>
          )}
        </View>

        {/* Action Cards */}
        <View style={styles.cardsSection}>
          <ActionCard
            icon="chat-outline"
            title="Continue conversation"
            subtitle={lastConvoSubtitle || 'Start a new conversation'}
            onPress={() => navigation.navigate('Chat')}
          />
          <ActionCard
            icon="file-edit-outline"
            title="Today's prompt"
            subtitle={todaysPrompt}
            onPress={() => {
              navigation.navigate('Journal', {
                screen: 'JournalEntry',
                params: { prompt: todaysPrompt },
              } as any);
            }}
          />
        </View>

        {/* Privacy Badge */}
        <PrivacyBadge />
      </ScrollView>
      )}

      {/* App Tour Modal */}
      <AppTour visible={showTour} onComplete={handleTourComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#908981',
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '500',
    color: '#2C2926',
  },
  moodSection: {
    marginBottom: 40,
  },
  chartSection: {
    marginBottom: 40,
  },
  emptyHint: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2DED6',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  emptyHintText: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#908981',
    textAlign: 'center',
  },
  cardsSection: {
    gap: 16,
    marginBottom: 40,
  },
});
