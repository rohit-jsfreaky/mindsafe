import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TourStep {
  icon: string;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    icon: 'emoticon-happy-outline',
    title: 'Track Your Mood',
    description:
      'Tap an emoji on the home screen to log how you feel. Your mood is tracked over the week so you can spot patterns.',
  },
  {
    icon: 'chat-outline',
    title: 'AI Companion',
    description:
      'Talk to MindSafe anytime — it listens, validates, and suggests coping techniques. All conversations stay on your device.',
  },
  {
    icon: 'notebook-outline',
    title: 'Daily Journal',
    description:
      'Write your thoughts and get an AI reflection after saving. A private space for self-discovery.',
  },
  {
    icon: 'chart-line',
    title: 'Insights',
    description:
      'See your mood trends, discover what helps you feel good, and get weekly AI reflections — all analyzed on-device.',
  },
  {
    icon: 'lock-outline',
    title: '100% Private',
    description:
      'MindSafe runs AI entirely on your phone. No cloud, no servers, no tracking. Your data never leaves your device.',
  },
];

interface AppTourProps {
  visible: boolean;
  onComplete: () => void;
}

export default function AppTour({ visible, onComplete }: AppTourProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const goTo = (index: number) => {
    if (index < 0 || index >= STEPS.length) return;
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (currentIndex === STEPS.length - 1) {
      onComplete();
    } else {
      goTo(currentIndex + 1);
    }
  };

  const isLast = currentIndex === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.card}>
          {/* Skip button */}
          <Pressable style={styles.skipButton} onPress={onComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          {/* Slides */}
          <FlatList
            ref={flatListRef}
            data={STEPS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <View style={styles.iconCircle}>
                  <Icon name={item.icon} size={36} color="#3D6B4F" />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH - 80,
              offset: (SCREEN_WIDTH - 80) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 80));
              setCurrentIndex(idx);
            }}
          />

          {/* Dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            {currentIndex > 0 ? (
              <Pressable style={styles.backBtn} onPress={() => goTo(currentIndex - 1)}>
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
            ) : (
              <View style={{ width: 60 }} />
            )}

            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {isLast ? 'Get Started' : 'Next'}
              </Text>
              {!isLast && <Icon name="arrow-right" size={16} color="#FFFFFF" />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CARD_WIDTH = SCREEN_WIDTH - 80;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    width: CARD_WIDTH,
    overflow: 'hidden',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#908981',
  },

  // Slide
  slide: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(143,169,139,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2926',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#908981',
    lineHeight: 22,
    textAlign: 'center',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2DED6',
  },
  dotActive: {
    backgroundColor: '#3D6B4F',
    width: 20,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#908981',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3D6B4F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
