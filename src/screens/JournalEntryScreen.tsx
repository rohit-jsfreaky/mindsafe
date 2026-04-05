import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/theme';
import { formatMonoDate } from '../utils/dateUtils';
import { MoodLevel } from '../types/mood';
import { JournalEntry } from '../types/journal';
import JournalRepository from '../services/database/JournalRepository';
import LLMService from '../services/llm/LLMService';
import { SYSTEM_PROMPTS } from '../services/llm/PromptTemplates';
import type { JournalStackParamList } from '../app/Navigation';

type EntryRoute = RouteProp<JournalStackParamList, 'JournalEntry'>;

const MOOD_ICONS: { level: MoodLevel; icon: string }[] = [
  { level: 1, icon: 'emoticon-dead-outline' },
  { level: 2, icon: 'emoticon-sad-outline' },
  { level: 3, icon: 'emoticon-neutral-outline' },
  { level: 4, icon: 'emoticon-happy-outline' },
  { level: 5, icon: 'emoticon-excited-outline' },
];

export default function JournalEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute<EntryRoute>();
  const insets = useSafeAreaInsets();
  const entryId = route.params?.entryId;
  const promptText = route.params?.prompt;

  const [content, setContent] = useState('');
  const [moodLevel, setMoodLevel] = useState<MoodLevel | undefined>();
  const [aiReflection, setAiReflection] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [existingEntry, setExistingEntry] = useState<JournalEntry | null>(null);

  // Load existing entry if editing
  useEffect(() => {
    if (entryId) {
      loadEntry(entryId);
    }
  }, [entryId]);

  // Pre-fill prompt text if provided from Home screen
  const promptLabel = promptText || 'What is on your mind?';

  const loadEntry = async (id: string) => {
    try {
      const entry = await JournalRepository.getEntry(id);
      if (entry) {
        setExistingEntry(entry);
        setContent(entry.content);
        setMoodLevel(entry.moodLevel);
        setAiReflection(entry.aiReflection);
      }
    } catch (err) {
      console.warn('[JournalEntry] Failed to load entry:', err);
    }
  };

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Empty Entry', 'Write something before saving.');
      return;
    }

    setIsSaving(true);

    try {
      let savedEntry: JournalEntry;

      if (existingEntry) {
        await JournalRepository.updateEntry(
          existingEntry.id,
          trimmed,
          moodLevel,
        );
        savedEntry = { ...existingEntry, content: trimmed, moodLevel };
      } else {
        savedEntry = await JournalRepository.createEntry(trimmed, moodLevel);
        setExistingEntry(savedEntry);
      }

      // Generate AI reflection
      setIsReflecting(true);
      try {
        if (LLMService.isReady() || (await tryInitModel())) {
          const reflection = await LLMService.complete(
            SYSTEM_PROMPTS.journalReflection,
            trimmed,
          );
          setAiReflection(reflection);
          await JournalRepository.saveReflection(savedEntry.id, reflection);
        }
      } catch (err) {
        console.warn('[JournalEntry] AI reflection failed:', err);
      } finally {
        setIsReflecting(false);
      }
    } catch (err) {
      console.warn('[JournalEntry] Save failed:', err);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tryInitModel = async (): Promise<boolean> => {
    try {
      await LLMService.initialize();
      return true;
    } catch {
      return false;
    }
  };

  const handleBack = () => {
    if (content.trim() && !existingEntry) {
      Alert.alert('Discard Entry?', 'Your unsaved entry will be lost.', [
        { text: 'Keep Writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const dateStr = existingEntry
    ? formatMonoDate(new Date(existingEntry.createdAt))
    : formatMonoDate();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable onPress={handleBack} hitSlop={12}>
              <Icon name="arrow-left" size={24} color="#3D6B4F" />
            </Pressable>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            hitSlop={12}
          >
            <Text
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mood selector — larger circles (48px) centered */}
        <View style={styles.moodSection}>
          <View style={styles.moodRow}>
            {MOOD_ICONS.map((mood) => {
              const isSelected = moodLevel === mood.level;
              return (
                <Pressable
                  key={mood.level}
                  style={[
                    styles.moodCircle,
                    isSelected && styles.moodCircleSelected,
                  ]}
                  onPress={() => setMoodLevel(mood.level)}
                >
                  <Icon
                    name={mood.icon}
                    size={26}
                    color={isSelected ? '#3D6B4F' : '#908981'}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Prompt label */}
        <Text style={styles.promptLabel}>{promptLabel}</Text>

        {/* Text area */}
        <TextInput
          style={styles.textArea}
          placeholder="Start typing your reflection..."
          placeholderTextColor="rgba(201,182,126,0.5)"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus={!entryId}
        />

        {/* AI Reflection */}
        {aiReflection ? (
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>AI REFLECTION</Text>
            <View style={styles.reflectionBorder}>
              <Text style={styles.reflectionText}>{aiReflection}</Text>
            </View>
          </View>
        ) : isReflecting ? (
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>GENERATING REFLECTION...</Text>
            <View style={styles.reflectionBorder}>
              <Text style={styles.reflectionText}>
                Thinking about your entry...
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              AI reflection will appear after saving
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
  },
  headerInner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#908981',
  },
  saveButton: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3D6B4F',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // Mood selector — 48px circles, centered
  moodSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2DED6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleSelected: {
    borderWidth: 2,
    borderColor: '#3D6B4F',
    backgroundColor: 'rgba(143,169,139,0.1)',
  },

  // Prompt
  promptLabel: {
    fontSize: 14,
    color: '#908981',
    marginBottom: 24,
  },

  // Text area
  textArea: {
    fontSize: 16,
    lineHeight: 26,
    color: '#2C2926',
    minHeight: 200,
    padding: 0,
  },

  // AI Reflection
  reflectionCard: {
    marginTop: 40,
  },
  reflectionLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#908981',
    marginBottom: 8,
    marginLeft: 16,
  },
  reflectionBorder: {
    borderLeftWidth: 3,
    borderLeftColor: '#8FA98B',
    paddingLeft: 16,
    paddingVertical: 4,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5C5650',
  },

  // Hint
  hintContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 120,
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#908981',
  },
});
