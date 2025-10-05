import { StatusBar } from 'expo-status-bar';

import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScanReceiptScreen from './screens/ScanReceiptScreen';
import MyReceiptsScreen from './screens/MyReceiptsScreen';
import MonthlySummaryScreen from './screens/MonthlySummaryScreen';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

interface TabBarIconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}

function TabBarIcon({ name, color, size, focused }: TabBarIconProps) {
  return (
    <View className="items-center">
      <MaterialIcons name={name} size={size} color={color} />
      {focused && <View className="mt-1 h-1 w-1 rounded-full bg-blue-600" />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof MaterialIcons.glyphMap = 'help-outline'; // default fallback icon
                if (route.name === 'Scan') {
                  iconName = focused ? 'camera' : 'camera-alt';
                } else if (route.name === 'Receipts') {
                  iconName = focused ? 'receipt' : 'receipt-long';
                } else if (route.name === 'Summary') {
                  iconName = focused ? 'bar-chart' : 'stacked-bar-chart';
                }
                return <TabBarIcon name={iconName} color={color} size={size} focused={focused} />;
              },
              tabBarActiveTintColor: '#2563eb',
              tabBarInactiveTintColor: '#6b7280',
              tabBarStyle: {
                backgroundColor: '#f9fafb',
                borderTopWidth: 1,
                borderRadius: 20,
                borderTopColor: '#e5e7eb',
                height: 70,
                marginInline: 20,
                marginBottom: 10,
                paddingTop: 10,
                position: 'absolute',
              },
              tabBarLabelStyle: {
                fontSize: 12,
                marginBottom: 4,
              },
            })}>
            <Tab.Screen
              name="Scan"
              component={ScanReceiptScreen}
              options={{
                headerTitle: 'Scan Receipt',
                headerTitleAlign: 'center', // iOS & Android consistency
                headerTintColor: '#3B82F6', // theme-aware back button & title
                headerStyle: {
                  backgroundColor: '#f5f5f5', // theme color token
                  elevation: 0, // remove Android shadow
                  shadowOpacity: 0, // remove iOS shadow
                },
                headerTitleStyle: {
                  fontWeight: '900', // semibold is sharper on device
                  fontSize: 24,
                  color: '#111827', // theme-aware text color
                },
              }}
            />
            <Tab.Screen
              name="Receipts"
              component={MyReceiptsScreen}
              options={{
                headerTitle: 'My Receipts',
                headerTitleAlign: 'center', // iOS & Android consistency
                headerTintColor: '#3B82F6', // theme-aware back button & title
                headerStyle: {
                  backgroundColor: '#f5f5f5', // theme color token
                  elevation: 0, // remove Android shadow
                  shadowOpacity: 0, // remove iOS shadow
                },
                headerTitleStyle: {
                  fontWeight: '900', // semibold is sharper on device
                  fontSize: 24,
                  color: '#111827', // theme-aware text color
                },
              }}
            />
            <Tab.Screen
              name="Summary"
              component={MonthlySummaryScreen}
              options={{
                headerTitle: 'Monthly Summary',
                headerTitleAlign: 'center', // iOS & Android consistency
                headerTintColor: '#3B82F6', // theme-aware back button & title
                headerStyle: {
                  backgroundColor: '#f5f5f5', // theme color token
                  elevation: 0, // remove Android shadow
                  shadowOpacity: 0, // remove iOS shadow
                },
                headerTitleStyle: {
                  fontWeight: '900', // semibold is sharper on device
                  fontSize: 24,
                  color: '#111827', // theme-aware text color
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
