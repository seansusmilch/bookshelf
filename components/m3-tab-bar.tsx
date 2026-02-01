import { CommonActions, TabNavigationState } from '@react-navigation/native';
import { Platform } from 'react-native';
import { BottomNavigation } from 'react-native-paper';

import { IconSymbol } from '@/components/ui/icon-symbol';

interface M3TabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: any;
  navigation: any;
  insets: { bottom: number; top: number; left: number; right: number };
}

interface ParamListBase {
  [key: string]: object | undefined;
}

export function M3TabBar({ state, descriptors, navigation, insets }: M3TabBarProps) {
  const routes = state.routes.map((route: any) => {
    const { options } = descriptors[route.key];
    const { title } = options;

    let iconName = 'book.fill';
    if (title === 'Search') {
      iconName = 'magnifyingglass';
    } else if (title === 'Stats') {
      iconName = 'chart.bar.fill';
    }

    return {
      key: route.key,
      title: title ?? '',
      focusedIcon: ({ color }: { color: string }) => (
        <IconSymbol size={24} name={iconName as any} color={color} />
      ),
      unfocusedIcon: ({ color }: { color: string }) => (
        <IconSymbol size={24} name={iconName as any} color={color} />
      ),
    };
  });

  const handleTabPress = ({ route }: { route: any }) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      const originalRoute = state.routes.find((r: any) => r.key === route.key);
      if (originalRoute) {
        navigation.dispatch(CommonActions.navigate(originalRoute.name, originalRoute.params));
      }
    }
  };

  return (
    <BottomNavigation.Bar
      navigationState={{ index: state.index, routes }}
      onTabPress={handleTabPress}
      labeled={true}
      shifting={false}
      keyboardHidesNavigationBar={Platform.OS === 'android'}
      safeAreaInsets={insets}
    />
  );
}
