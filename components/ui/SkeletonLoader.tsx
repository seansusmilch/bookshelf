import { useEffect } from 'react';
import { View, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
};

export const Skeleton = ({ width, height, borderRadius = 8 }: SkeletonProps) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.ease }),
        withTiming(0, { duration: 1200, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmerValue.value * 0.7,
  }));

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.4)',
            transform: [{ skewX: '-20deg' as const }],
            left: '-100%',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonCard = () => {
  return (
    <View className="rounded-xl shadow-sm p-3 overflow-hidden">
      <View className="flex-row gap-3">
        <Skeleton width={128} height={176} borderRadius={8} />
        <View className="flex-1 justify-between py-1">
          <View className="gap-2">
            <Skeleton width="90%" height={24} borderRadius={4} />
            <Skeleton width="70%" height={18} borderRadius={4} />
            <Skeleton width="50%" height={16} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

export const SearchSkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};
