import { AppState, AppStateStatus, Platform } from 'react-native';
import RNFS from 'react-native-fs2';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { MODEL_FILENAME, MODEL_URL, MODEL_SIZE_MB } from '../../utils/constants';

const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/models`;
const NOTIF_CHANNEL_ID = 'mindsafe-download';
const NOTIF_ID = 'model-download';

let currentJobId: number | null = null;

export function getModelPath(): string {
  return `${MODELS_DIR}/${MODEL_FILENAME}`;
}

export async function isModelDownloaded(): Promise<boolean> {
  return RNFS.exists(getModelPath());
}

export async function getModelFileSize(): Promise<number> {
  const path = getModelPath();
  if (await RNFS.exists(path)) {
    const stat = await RNFS.stat(path);
    return Number(stat.size);
  }
  return 0;
}

export function getExpectedModelSizeMB(): number {
  return MODEL_SIZE_MB;
}

/** Create the notification channel (call once at init) */
async function ensureNotifChannel(): Promise<void> {
  await notifee.createChannel({
    id: NOTIF_CHANNEL_ID,
    name: 'Model Download',
    description: 'Shows AI model download progress',
    importance: AndroidImportance.LOW, // no sound, just progress bar
  });
}

/** Update or create the progress notification */
async function updateProgressNotification(percent: number): Promise<void> {
  try {
    await notifee.displayNotification({
      id: NOTIF_ID,
      title: 'Downloading AI model',
      body: percent < 100 ? `${percent}% complete` : 'Download complete!',
      android: {
        channelId: NOTIF_CHANNEL_ID,
        ongoing: percent < 100,
        onlyAlertOnce: true,
        smallIcon: 'ic_notification',
        progress: {
          max: 100,
          current: percent,
          indeterminate: false,
        },
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Notification may fail if permissions not granted — don't block download
  }
}

async function dismissNotification(): Promise<void> {
  try {
    await notifee.cancelNotification(NOTIF_ID);
  } catch {}
}

export async function downloadModel(
  onProgress: (percent: number) => void,
): Promise<string> {
  const filePath = getModelPath();

  // Already downloaded
  if (await RNFS.exists(filePath)) {
    onProgress(100);
    return filePath;
  }

  // Ensure directory exists
  if (!(await RNFS.exists(MODELS_DIR))) {
    await RNFS.mkdir(MODELS_DIR);
  }

  // Setup notification channel
  await ensureNotifChannel();

  let lastNotifUpdate = 0;

  return new Promise<string>((resolve, reject) => {
    const { jobId, promise } = RNFS.downloadFile({
      fromUrl: MODEL_URL,
      toFile: filePath,
      background: true,           // Continue download in background
      progressInterval: 1000,
      progress: (res) => {
        if (res.contentLength > 0) {
          const percent = Math.round(
            (res.bytesWritten / res.contentLength) * 100,
          );
          onProgress(percent);

          // Update notification at most every 2 seconds to avoid spamming
          const now = Date.now();
          if (now - lastNotifUpdate > 2000 || percent === 100) {
            lastNotifUpdate = now;
            updateProgressNotification(percent);
          }
        }
      },
      begin: (res) => {
        console.log(
          `[ModelDownloader] Download started. Size: ${(res.contentLength / (1024 * 1024)).toFixed(0)} MB`,
        );
        updateProgressNotification(0);
      },
    });

    currentJobId = jobId;

    promise
      .then(async (result) => {
        currentJobId = null;
        if (result.statusCode === 200 || result.statusCode === 206) {
          onProgress(100);
          await updateProgressNotification(100);
          // Auto-dismiss after 3s
          setTimeout(() => dismissNotification(), 3000);
          resolve(filePath);
        } else {
          RNFS.unlink(filePath).catch(() => {});
          await dismissNotification();
          reject(
            new Error(`Download failed with status ${result.statusCode}`),
          );
        }
      })
      .catch(async (error) => {
        currentJobId = null;
        if (await RNFS.exists(filePath)) {
          RNFS.unlink(filePath).catch(() => {});
        }
        await dismissNotification();
        reject(error);
      });
  });
}

export function cancelDownload(): void {
  if (currentJobId !== null) {
    RNFS.stopDownload(currentJobId);
    currentJobId = null;
    dismissNotification();
  }
}

export async function deleteModel(): Promise<void> {
  const filePath = getModelPath();
  if (await RNFS.exists(filePath)) {
    await RNFS.unlink(filePath);
  }
}

export async function getAvailableStorage(): Promise<number> {
  const info = await RNFS.getFSInfo();
  return Math.round(info.freeSpace / (1024 * 1024)); // MB
}

export async function hasEnoughStorage(): Promise<boolean> {
  const available = await getAvailableStorage();
  return available > MODEL_SIZE_MB + 500;
}
