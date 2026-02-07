import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  RotateInDownLeft,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '@/components/material3-provider';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

export const SearchLoadingState = () => {
  const { colors } = useAppTheme();

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [rotation, pulse]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View className="items-center justify-center py-16">
      <Animated.View style={pulseStyle}>
        <Animated.View style={rotationStyle} entering={RotateInDownLeft.duration(600)}>
          <View className="relative">
            <View className="absolute inset-0 items-center justify-center">
              <View
                className="w-16 h-16 rounded-full opacity-20"
                style={{ backgroundColor: colors.primary }}
              />
            </View>
            <AnimatedIcon
              name="library-books"
              size={64}
              color={colors.primary}
              style={rotationStyle}
            />
          </View>
        </Animated.View>
      </Animated.View>
      <Text
        className="text-lg mt-6 font-medium"
        style={{ color: colors.onSurface }}
      >
        Searching books...
      </Text>
      <Text
        className="text-sm mt-2"
        style={{ color: colors.onSurfaceVariant }}
      >
        Looking through Open Library
      </Text>
    </View>
  );
};

export const EmptySearchState = () => {
  const { colors } = useAppTheme();

  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 1500, easing: Easing.ease }),
        withTiming(-10, { duration: 1500, easing: Easing.ease }),
        withTiming(10, { duration: 1500, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View className="items-center justify-center py-16">
      <Animated.View style={floatStyle}>
        <MaterialIcons
          name="auto-stories"
          size={80}
          color={colors.primary}
        />
      </Animated.View>
      <Text
        className="text-xl font-semibold mt-6 mb-2"
        style={{ color: colors.onSurface }}
      >
        Search for books
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: colors.onSurfaceVariant }}
      >
        Enter a title, author, or keyword to find books from Open Library.
      </Text>
    </View>
  );
};

export const NoResultsState = () => {
  const { colors } = useAppTheme();

  const shake = useSharedValue(0);

  useEffect(() => {
    shake.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, [shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View className="items-center justify-center py-16">
      <Animated.View style={shakeStyle}>
        <MaterialIcons
          name="search-off"
          size={80}
          color={colors.onSurfaceVariant}
        />
      </Animated.View>
      <Text
        className="text-xl font-semibold mt-6 mb-2"
        style={{ color: colors.onSurface }}
      >
        No results found
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: colors.onSurfaceVariant }}
      >
        Try a different search term or check your spelling.
      </Text>
    </View>
  );
};
