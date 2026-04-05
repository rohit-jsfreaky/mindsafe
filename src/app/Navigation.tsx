import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import JournalScreen from '../screens/JournalScreen';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import InsightsScreen from '../screens/InsightsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Settings: undefined;
};

export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { entryId?: string; prompt?: string } | undefined;
};

export type ChatStackParamList = {
  ChatMain: { conversationId?: string } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const JournalStack = createNativeStackNavigator<JournalStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const Tab = createMaterialTopTabNavigator();

function JournalNavigator() {
  return (
    <JournalStack.Navigator screenOptions={{ headerShown: false }}>
      <JournalStack.Screen name="JournalList" component={JournalScreen} />
      <JournalStack.Screen name="JournalEntry" component={JournalEntryScreen} />
    </JournalStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatMain" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarPressColor: 'rgba(61,107,79,0.08)',
        tabBarIndicatorStyle: { display: 'none' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(226,222,214,0.4)',
          borderTopWidth: 1,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          height: 56 + bottomPadding,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          textTransform: 'none',
          marginTop: 0,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'chat' : 'chat-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'notebook' : 'notebook-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'chart-line-variant' : 'chart-line'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator({ isOnboarded }: { isOnboarded: boolean }) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboarded ? (
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
    </RootStack.Navigator>
  );
}
