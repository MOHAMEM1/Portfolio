import { Tabs, router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform, View, Text, Animated, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getIconName(routeName: string) {
  switch (routeName) {
    case 'agent': return 'wallet';
    case 'transfers': return 'swap-horizontal';
    case 'index': return 'home';
    case 'payments': return 'card';
    case 'account': return 'person';
    default: return 'home';
  }
}

const TabIconWrapper = ({ name, isFocused, activeColor, inactiveColor }: any) => {
  const translateY = useRef(new Animated.Value(isFocused ? -14 : 0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isFocused ? -14 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 45,
    }).start();
  }, [isFocused]);

  const activeIconName = name;
  const inactiveIconName = name === 'swap-horizontal' ? 'swap-horizontal' : `${name}-outline`;

  return (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Ionicons 
          name={isFocused ? activeIconName : inactiveIconName} 
          size={isFocused ? 26 : 24} 
          color={isFocused ? activeColor : inactiveColor} 
        />
      </Animated.View>
    </View>
  );
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const tabWidth = windowWidth / state.routes.length;
  const circleWidth = 58;
  const centerOffset = (tabWidth - circleWidth) / 2;

  const activeIndex = state.index;
  const slideAnim = useRef(new Animated.Value(activeIndex * tabWidth + centerOffset)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth + centerOffset,
      useNativeDriver: true,
      friction: 7,
      tension: 45,
    }).start();
  }, [activeIndex]);

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 15);
  const barHeight = 65 + bottomPadding;

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: isDark ? '#111111' : '#FFFFFF', height: barHeight, paddingBottom: bottomPadding }]}>
      {/* Sliding Gold Circle Backdrop */}
      <Animated.View style={[styles.slidingCircle, {
        backgroundColor: colors.primary || '#D4AF37',
        transform: [{ translateX: slideAnim }],
        shadowColor: colors.primary || '#D4AF37',
      }]} />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            const href = route.name === 'index' ? '/(tabs)/' : `/(tabs)/${route.name}`;
            // @ts-ignore
            router.navigate(href);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.9}
            style={[styles.tabItem, { width: tabWidth }]}
          >
            <TabIconWrapper 
              name={getIconName(route.name)} 
              isFocused={isFocused} 
              activeColor="#000000" 
              inactiveColor={isDark ? '#718096' : '#A0AEC0'} 
            />
            <Text style={[
              styles.tabLabel, 
              { 
                color: isFocused ? (colors.primary || '#D4AF37') : (isDark ? '#718096' : '#A0AEC0'),
                fontFamily: colors.fontFamily || 'System'
              }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="agent"
        options={{ title: t('tabs.agent', 'Réseau') }}
      />

      <Tabs.Screen
        name="transfers"
        options={{ title: t('tabs.transfers', 'Transferts') }}
      />

      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home', 'Comptes') }}
      />

      <Tabs.Screen
        name="payments"
        options={{ title: t('tabs.payments', 'Paiements') }}
      />

      <Tabs.Screen
        name="account"
        options={{ title: t('tabs.account', 'Compte') }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slidingCircle: {
    position: 'absolute',
    top: 6,
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -16, // Float slightly above the bar
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
});
