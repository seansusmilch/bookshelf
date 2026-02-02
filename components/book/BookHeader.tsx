import { View, Text, Image, Pressable } from 'react-native';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type BookHeaderProps = {
  title: string;
  author: string;
  coverUrl?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  className?: string;
};

export const BookHeader = ({
  title,
  author,
  coverUrl,
  showBackButton = false,
  onBackPress,
  className = '',
}: BookHeaderProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`relative overflow-hidden ${className}`} style={{ backgroundColor: colors.surface }}>
      <View
        className="absolute inset-0"
        style={{ backgroundColor: colors.primaryContainer }}
      />

      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          className="w-full h-48 opacity-20"
          resizeMode="cover"
          blurRadius={20}
        />
      ) : (
        <View className="absolute inset-0 opacity-10 items-center justify-center">
          <MaterialIcons name="menu-book" size={128} color={colors.onSurface} />
        </View>
      )}

      {showBackButton && (
        <Pressable
          onPress={onBackPress}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      )}

      <View className="relative px-6 pt-16 pb-8 items-center">
        {coverUrl ? (
          <View className="shadow-2xl mb-6 rounded-xl overflow-hidden">
            <Image
              source={{ uri: coverUrl }}
              className="w-36 h-52"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View
            className="w-36 h-52 rounded-xl items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: colors.surfaceContainerHighest }}
          >
            <MaterialIcons name="menu-book" size={64} color={colors.onSurfaceVariant} />
          </View>
        )}

        <Text
          className="text-2xl font-bold text-center mb-2"
          style={{ color: colors.onSurface }}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          className="text-base text-center"
          style={{ color: colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {author}
        </Text>
      </View>
    </View>
  );
};

type CompactBookHeaderProps = {
  title: string;
  author: string;
  coverUrl?: string;
  className?: string;
};

export const CompactBookHeader = ({
  title,
  author,
  coverUrl,
  className = '',
}: CompactBookHeaderProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row items-center gap-4 p-4 ${className}`}>
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          className="w-16 h-24 rounded-lg shadow-md"
          resizeMode="cover"
        />
      ) : (
        <View
          className="w-16 h-24 rounded-lg items-center justify-center"
          style={{ backgroundColor: colors.surfaceContainerHighest }}
        >
          <MaterialIcons name="menu-book" size={28} color={colors.onSurfaceVariant} />
        </View>
      )}

      <View className="flex-1">
        <Text
          className="text-lg font-semibold mb-1"
          style={{ color: colors.onSurface }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          className="text-sm"
          style={{ color: colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {author}
        </Text>
      </View>
    </View>
  );
};
