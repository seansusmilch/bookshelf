import { Pressable, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OpenLibraryBook } from '@/hooks/useSearchBooks';
import { useAppTheme } from '@/components/material3-provider';
import { CoverSize, getCoverUrl, getEditionOlid } from '~/lib/openlibrary';

interface AnimatedBookItemProps {
  book: OpenLibraryBook;
  index: number;
  onPress: (book: OpenLibraryBook) => void;
  failedImages: Set<string>;
  onImageError: (coverUrl: string) => void;
  isInShelf?: boolean;
}

export const AnimatedBookItem = ({
  book,
  index,
  onPress,
  failedImages,
  onImageError,
  isInShelf,
}: AnimatedBookItemProps) => {
  const { colors } = useAppTheme();

  const editionOlid = getEditionOlid(book);
  const coverUrl = editionOlid ? getCoverUrl(editionOlid, CoverSize.Medium) : undefined;

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(
        index * 80,
        withTiming(1, { duration: 400 })
      ),
      transform: [
        {
          translateY: withDelay(
            index * 80,
            withTiming(0, { duration: 400 })
          ),
        },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withDelay(
            index * 80 + 200,
            withTiming(1, { duration: 400 })
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ backgroundColor: colors.surface, borderRadius: 12 }, containerStyle]}
      entering={FadeIn.duration(500).delay(index * 80)}
    >
      <Pressable
        onPress={() => onPress(book)}
        className="rounded-xl p-3"
        style={{ gap: 12 }}
      >
        <View className="flex-row gap-3">
          <Animated.View
            style={[
              { width: 128, height: 176, borderRadius: 8, overflow: 'hidden' },
              imageStyle,
            ]}
          >
            {coverUrl && !failedImages.has(coverUrl) ? (
              <Animated.Image
                source={{ uri: coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: colors.surfaceContainerHighest }}
              >
                <MaterialIcons
                  name="book"
                  size={40}
                  color={colors.onSurfaceVariant}
                />
              </View>
            )}
          </Animated.View>

          <View className="flex-1 justify-between py-1">
            <View>
              <Text
                className="text-lg font-semibold"
                numberOfLines={2}
                style={{ color: colors.onSurface }}
              >
                {book.title}
              </Text>
              <Text
                className="text-base mt-1"
                numberOfLines={1}
                style={{ color: colors.onSurfaceVariant }}
              >
                {book.author_name?.join(', ') || 'Unknown Author'}
              </Text>
              {book.first_publish_year ? (
                <Text
                  className="text-sm mt-2"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Published: {book.first_publish_year}
                </Text>
              ) : null}
            </View>
            {isInShelf && (
              <View
                className="flex-row items-center gap-1 mt-2"
              >
                <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Already in your shelf
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};
