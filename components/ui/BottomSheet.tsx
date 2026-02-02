import { View, Pressable, Text, ScrollView, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, PanResponder, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/components/material3-provider';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: number;
  minHeight?: number;
};

export const BottomSheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeight,
  minHeight,
}: BottomSheetProps) => {
  const { colors } = useAppTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          Animated.timing(translateY, {
            toValue: sheetHeight.current || 500,
            duration: 250,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(600);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <Animated.View
          className="rounded-t-3xl overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            maxHeight,
            minHeight,
            transform: [{ translateY }],
          }}
          onLayout={(e) => {
            sheetHeight.current = e.nativeEvent.layout.height;
          }}
        >
          <View {...panResponder.panHandlers}>
            <Pressable onPress={onClose} className="items-center py-3">
              <View
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: colors.surfaceContainerHighest }}
              />
            </Pressable>

            {(title || subtitle) && (
              <View className="px-6 pb-4 border-b" style={{ borderColor: colors.outlineVariant }}>
                {title && (
                  <Text className="text-xl font-semibold" style={{ color: colors.onSurface }}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text className="text-sm mt-1" style={{ color: colors.onSurfaceVariant }}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="p-6"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

type BottomSheetListItemProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  right?: React.ReactNode;
};

export const BottomSheetListItem = ({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
  right,
}: BottomSheetListItemProps) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 p-4 rounded-xl mb-2"
      style={{
        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLow,
      }}
    >
      {icon && <View className="w-10 h-10 items-center justify-center">{icon}</View>}
      <View className="flex-1">
        <Text
          className="font-medium"
          numberOfLines={1}
          style={{ color: selected ? colors.onPrimaryContainer : colors.onSurface }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-sm mt-0.5"
            numberOfLines={1}
            style={{ color: selected ? colors.onPrimaryContainer : colors.onSurfaceVariant }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right || (
        selected && (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.onPrimary }} />
          </View>
        )
      )}
    </Pressable>
  );
};
