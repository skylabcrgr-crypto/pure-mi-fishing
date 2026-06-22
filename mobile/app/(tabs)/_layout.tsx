import { Tabs } from 'expo-router';
import { Compass, Bookmark, CloudSun, BookOpen, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { Colors } from '../../src/design/tokens';

const TAB_BG      = '#0A1628';
const TAB_BORDER  = 'rgba(79,195,247,0.10)';
const TAB_ACTIVE  = Colors.brand.orange;
const TAB_INACTIVE= 'rgba(245,245,240,0.38)';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="explore"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: TAB_BORDER,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size - 2} />,
          tabBarAccessibilityLabel: 'Explore map tab',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size - 2} />,
          tabBarAccessibilityLabel: 'My trips tab',
        }}
      />
      <Tabs.Screen
        name="conditions"
        options={{
          title: 'Conditions',
          tabBarIcon: ({ color, size }) => <CloudSun color={color} size={size - 2} />,
          tabBarAccessibilityLabel: 'Water conditions tab',
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size - 2} />,
          tabBarAccessibilityLabel: 'Catch logbook tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}
