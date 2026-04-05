import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/theme';
import InsightsRepository from '../services/database/InsightsRepository';
import LLMService from '../services/llm/LLMService';
import { SYSTEM_PROMPTS } from '../services/llm/PromptTemplates';
import Header from '../components/common/Header';
import MoodTrendChart from '../components/mood/MoodTrendChart';
import FactorsChart from '../components/insights/FactorsChart';
import WeeklyReflection from '../components/insights/WeeklyReflection';
import PrivacyBadge from '../components/common/PrivacyBadge';
import InsightsSkeleton from '../components/skeletons/InsightsSkeleton';

export default function InsightsScreen() {
  const [moodTrend, setMoodTrend] = useState<{ week: string; average: number }[]>([]);
  const [factors, setFactors] = useState<{ factor: string; count: number }[]>([]);
  const [reflectionText, setReflectionText] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, []),
  );

  const loadInsights = async () => {
    try {
      const enough = await InsightsRepository.hasEnoughData();
      setHasData(enough);

      const [trend, topFactors] = await Promise.all([
        InsightsRepository.getMoodTrend(4),
        InsightsRepository.getPositiveFactors(30, 4),
      ]);

      setMoodTrend(trend);
      setFactors(topFactors);

      // Always try to generate a reflection summary
      generateReflection();
    } catch (err) {
      console.warn('[InsightsScreen] Failed to load insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReflection = async () => {
    try {
      const summaryText = await InsightsRepository.getRecentMoodSummaryText();
      setReflectionText(summaryText);

      // Try AI-generated reflection if model is available
      if (LLMService.isReady()) {
        setIsReflecting(true);
        const aiReflection = await LLMService.complete(
          SYSTEM_PROMPTS.moodAnalysis,
          summaryText,
        );
        setReflectionText(aiReflection);
        setIsReflecting(false);
      }
    } catch (err) {
      console.warn('[InsightsScreen] Reflection generation failed:', err);
      setIsReflecting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Insights" showBack={false} showMenu={false} />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <InsightsSkeleton />
        </ScrollView>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.heroSubtitle}>Your patterns over 30 days</Text>

        {/* Mood Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MOOD TREND</Text>
          <MoodTrendChart data={moodTrend} />
        </View>

        {/* Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT HELPS YOU FEEL GOOD</Text>
          <FactorsChart data={factors} />
        </View>

        {/* Weekly Reflection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WEEKLY REFLECTION</Text>
          {hasData || reflectionText ? (
            <WeeklyReflection
              text={
                reflectionText ||
                'Start logging your mood to see weekly insights here.'
              }
              isLoading={isReflecting}
            />
          ) : (
            <View style={styles.reflectionEmpty}>
              <View style={styles.reflectionEmptyAccent} />
              <View style={styles.reflectionEmptyContent}>
                <Text style={styles.reflectionEmptyText}>
                  Insights will emerge as you journal
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Encouragement card */}
        {!hasData && (
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              Your AI companion is observing your progress. Your first reflection
              will appear here soon.
            </Text>
          </View>
        )}

        {/* Privacy badge */}
        <PrivacyBadge text="All analysis happens on your phone" />
      </ScrollView>
      )}
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

  heroSubtitle: {
    fontSize: 14,
    color: '#908981',
    marginBottom: 24,
  },

  // Sections
  section: {
    marginBottom: 32,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C2926',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Weekly reflection empty state
  reflectionEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2DED6',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  reflectionEmptyAccent: {
    width: 3,
    backgroundColor: '#E2DED6',
  },
  reflectionEmptyContent: {
    flex: 1,
    padding: 16,
  },
  reflectionEmptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#908981',
    lineHeight: 22,
  },

  // Encouragement card
  encouragementCard: {
    backgroundColor: 'rgba(143,169,139,0.06)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  encouragementText: {
    fontSize: 14,
    color: '#908981',
    textAlign: 'center',
    lineHeight: 22,
  },
});
