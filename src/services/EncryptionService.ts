import Aes from 'react-native-aes-crypto';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.mindsafe.encryption';
const AES_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

class EncryptionService {
  private encryptionKey: string | null = null;

  async initialize(): Promise<void> {
    this.encryptionKey = await this.getOrCreateKey();
  }

  private async getOrCreateKey(): Promise<string> {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }

    // Generate a new random key
    const newKey = await Aes.randomKey(KEY_LENGTH);

    await Keychain.setGenericPassword('mindsafe', newKey, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return newKey;
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const iv = await Aes.randomKey(IV_LENGTH);
    const cipher = await Aes.encrypt(
      plaintext,
      this.encryptionKey!,
      iv,
      AES_ALGORITHM,
    );

    // Store IV with ciphertext: iv:ciphertext
    return `${iv}:${cipher}`;
  }

  async decrypt(encrypted: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const [iv, cipher] = encrypted.split(':');
    if (!iv || !cipher) {
      throw new Error('Invalid encrypted data format');
    }

    return Aes.decrypt(cipher, this.encryptionKey!, iv, AES_ALGORITHM);
  }
}

export default new EncryptionService();
