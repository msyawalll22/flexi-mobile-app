import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type TabIconProps = {
  emoji: string;
  label: string;
  focused: boolean;
  color: string;
  mutedColor: string;
};

function TabIcon({ emoji, label, focused, color, mutedColor }: TabIconProps) {
  return (
    <View style={styles.tabIconWrap}>
      <View
        style={[
          styles.iconCircle,
          focused && { backgroundColor: color + '20' },
        ]}
      >
        <Text style={[styles.emoji, { opacity: focused ? 1 : 0.55 }]}>
          {emoji}
        </Text>
      </View>
      <Text
        style={[
          styles.label,
          focused ? { color, fontWeight: '800' } : { color: mutedColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppTabs() {
  const { colors, brand, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            shadowOpacity: isDark ? 0 : 0.05,
          },
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: brand.primaryLight,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Komitmen',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🏠"
              label="Komitmen"
              focused={focused}
              color={brand.primaryLight}
              mutedColor={colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: 'Hutang',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="💳"
              label="Hutang"
              focused={focused}
              color={brand.primaryLight}
              mutedColor={colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spending"
        options={{
          title: 'Spending',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="💰"
              label="Spending"
              focused={focused}
              color={brand.purple}
              mutedColor={colors.textSecondary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  iconCircle: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});