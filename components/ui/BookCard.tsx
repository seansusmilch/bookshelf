import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/tw';
import { Id } from 'convex/_generated/dataModel';

type BookProps = {
  _id: Id<'books'>;
  title: string;
  author: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  status: string;
  rating?: { rating: number };
};

type BookCardProps = {
  book: BookProps;
  onPress?: () => void;
  onMenuPress?: () => void;
};

export const BookCard = ({ book, onPress, onMenuPress }: BookCardProps) => {
  const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  return (
    <Pressable onPress={onPress} className="mb-3 bg-white rounded-xl shadow-sm">
      <View className="flex-row p-3 gap-3">
        <View className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <Text className="text-gray-400 text-xs">No cover</Text>
            </View>
          )}
        </View>

        <View className="flex-1 justify-between py-1">
          <View>
            <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
              {book.title}
            </Text>
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
              {book.author}
            </Text>
          </View>

          <View>
            {book.status === 'reading' && (
              <View className="mt-2">
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  {book.currentPage} / {book.totalPages} pages
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between mt-2">
              {book.rating && (
                <View className="flex-row items-center gap-1">
                  <FontAwesome name="star" size={12} color="#f59e0b" />
                  <Text className="text-xs text-gray-600">{book.rating.rating}</Text>
                </View>
              )}

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onMenuPress?.();
                }}
                className="p-1 -mr-1"
              >
                <FontAwesome name="ellipsis-v" size={16} color="#6b7280" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
