import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigator from './Navigation';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../utils/theme';
import DatabaseService from '../services/database/DatabaseService';
import EncryptionService from '../services/EncryptionService';

export default function App() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setUserName = useAppStore((s) => s.setUserName);
  const setModelStatus = useAppStore((s) => s.setModelStatus);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Initialize core services
        await DatabaseService.initialize();
        await EncryptionService.initialize();

        const onboarded = await DatabaseService.getSetting('onboarded');

        if (onboarded === 'true') {
          setOnboarded(true);
          setModelStatus('downloaded');

          // Restore user name
          const name = await DatabaseService.getSetting('user_name');
          if (name) setUserName(name);
        }
      } catch (err) {
        console.warn('[App] Failed to check onboarding state:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <NavigationContainer>
          <RootNavigator isOnboarded={isOnboarded} />
        </NavigationContainer>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
