import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { View, Text, Pressable } from '@/tw';

type ProgressSliderProps = {
  currentPage: number;
  totalPages: number;
  onProgressChange: (page: number) => void;
};

export const ProgressSlider = ({
  currentPage,
  totalPages,
  onProgressChange,
}: ProgressSliderProps) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (e: any) => {
    const { locationX } = e.nativeEvent;
    if (sliderWidth > 0) {
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newPage = Math.round(percentage * totalPages);
      onProgressChange(Math.max(0, Math.min(totalPages, newPage)));
    }
  };

  return (
    <View className="px-4 py-3 bg-white rounded-lg">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm text-gray-600">Progress</Text>
        <Text className="text-sm font-semibold text-gray-900">
          {currentPage} / {totalPages} pages
        </Text>
      </View>

      <Pressable
        onPress={handlePress}
        onLayout={handleLayout}
        className="h-8 bg-gray-200 rounded-full overflow-hidden active:bg-gray-300"
      >
        <View
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </Pressable>

      <Text className="text-xs text-gray-500 mt-2 text-center">
        Tap to set your current page
      </Text>
    </View>
  );
};
