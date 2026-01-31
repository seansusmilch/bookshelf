import { ScrollView, Pressable, View, Text } from '@/tw';

type RatingPickerProps = {
  currentRating?: number;
  onRatingChange: (rating: number) => void;
};

export const RatingPicker = ({ currentRating, onRatingChange }: RatingPickerProps) => {
  return (
    <View className="px-4 py-3 bg-white rounded-lg">
      <Text className="text-sm text-gray-600 mb-3">Rate this book</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
        className="py-2"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <Pressable
            key={rating}
            onPress={() => onRatingChange(rating)}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentRating === rating ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                currentRating === rating ? 'text-white' : 'text-gray-700'
              }`}
            >
              {rating}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {currentRating && (
        <Text className="text-center text-sm text-blue-600 mt-2">
          Rating: {currentRating}/10
        </Text>
      )}
    </View>
  );
};
