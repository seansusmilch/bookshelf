import { useRef, useLayoutEffect } from 'react';
import { Animated } from 'react-native';

type UseScrollAnimationProps = {
  title?: string;
  colors: {
    onSurface: string;
    background: string;
  };
  navigation: any;
};

export const useScrollAnimation = ({ title, colors, navigation }: UseScrollAnimationProps) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerScrollProgress = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [50, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        elevation: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, 4],
          extrapolate: 'clamp',
        }) as any,
      },
      headerTitle: () => (
        <Animated.Text
          style={{
            color: colors.onSurface,
            opacity: titleOpacity,
            fontSize: 17,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {title || 'Add Book'}
        </Animated.Text>
      ),
      headerTransparent: true,
      headerBackground: () => (
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: headerScrollProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', colors.background],
            }),
          }}
        />
      ),
    });
  }, [navigation, colors, scrollY, title, headerScrollProgress, titleOpacity]);

  return { scrollY, headerScrollProgress, titleOpacity };
};
