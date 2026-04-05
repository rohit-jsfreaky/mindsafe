import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../utils/theme';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
  showIcon?: boolean;
  menuIcon?: string;
  rightElement?: React.ReactNode;
}

export default function Header({
  title = 'MindSafe',
  onBack,
  onMenu,
  showBack = true,
  showMenu = true,
  showIcon = true,
  menuIcon = 'dots-vertical',
  rightElement,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={styles.iconButton}
            >
              <Icon name="arrow-left" size={22} color="#255338" />
            </Pressable>
          )}
          {showIcon && !showBack && (
            <Icon name="spa" size={22} color="#255338" />
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {rightElement}
          {showMenu && (
            <Pressable
              onPress={onMenu}
              hitSlop={12}
              style={styles.iconButton}
            >
              <Icon name={menuIcon} size={22} color="#908981" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  inner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#255338',
    letterSpacing: -0.3,
  },
});
