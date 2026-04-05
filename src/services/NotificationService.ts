import notifee, {
  TriggerType,
  RepeatFrequency,
  AndroidImportance,
  AndroidCategory,
} from '@notifee/react-native';

const CHANNEL_ID = 'mindsafe-checkin';
const CHECKIN_NOTIFICATION_ID = 'daily-checkin';

const CHECKIN_MESSAGES = [
  'How are you feeling right now?',
  'Take a moment to check in with yourself.',
  'Your feelings matter — log your mood today.',
  'A quick check-in can make a big difference.',
  "What's on your mind today?",
];

class NotificationService {
  async initialize(): Promise<void> {
    // Create Android notification channel
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Daily Check-in',
      description: 'Gentle daily mood check-in reminders',
      importance: AndroidImportance.DEFAULT,
    });
  }

  /**
   * Schedule a daily check-in notification.
   * @param hour Hour of day (0-23), default 20 (8 PM)
   * @param minute Minute, default 0
   */
  async scheduleDailyCheckin(hour: number = 20, minute: number = 0): Promise<void> {
    // Cancel any existing
    await this.cancelDailyCheckin();

    // Calculate next trigger time
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (trigger.getTime() <= now.getTime()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const randomMessage =
      CHECKIN_MESSAGES[Math.floor(Math.random() * CHECKIN_MESSAGES.length)]!;

    await notifee.createTriggerNotification(
      {
        id: CHECKIN_NOTIFICATION_ID,
        title: 'MindSafe',
        body: randomMessage,
        android: {
          channelId: CHANNEL_ID,
          category: AndroidCategory.REMINDER,
          pressAction: { id: 'default' },
          smallIcon: 'ic_notification',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  }

  async cancelDailyCheckin(): Promise<void> {
    await notifee.cancelNotification(CHECKIN_NOTIFICATION_ID);
  }

  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  }
}

export default new NotificationService();
