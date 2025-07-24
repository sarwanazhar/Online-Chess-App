import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Header from '@/components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { TouchableOpacity, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs screenOptions={{
          tabBarStyle: { backgroundColor: '#2D2D2D', borderTopWidth: 0, height: hp('19%'), paddingTop: hp('2%'), paddingBottom: hp('2%') },
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: '#CCCCCC',
          header: (props) => <Header {...props} />,
          tabBarButton: ({ children, onPress, onLongPress, style }) => (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              style={style}
              android_ripple={null}
            >
              {children}
            </Pressable>
          ),
        }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            }}
          />
          <Tabs.Screen
            name="games"
            options={{
              title: 'Games',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="gamepad" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
              headerShown: false,
            }}

          />
        </Tabs>
    </GestureHandlerRootView>
  );
}
