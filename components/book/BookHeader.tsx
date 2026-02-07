import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, Text, View } from 'react-native';

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
  const backgroundColor = colors.background;

  return (
    <View className={`relative overflow-hidden ${className}`} style={{ height: 400 }}>
      <View className="absolute inset-0" style={{ backgroundColor }} />

      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
          blurRadius={25}
        />
      ) : (
        <View className="absolute inset-0 opacity-10 items-center justify-center">
          <MaterialIcons name="menu-book" size={200} color={colors.onSurface} />
        </View>
      )}

      <View className="absolute inset-0 bg-black/50" />

      {showBackButton && (
        <Pressable
          onPress={onBackPress}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      )}

      <View className="flex-1 items-center justify-end pb-8 z-10">
        {coverUrl ? (
          <View className="shadow-2xl rounded-xl overflow-hidden mb-5">
            <Image
              source={{ uri: coverUrl }}
              className="w-32 h-48"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View
            className="w-32 h-48 rounded-xl items-center justify-center shadow-lg mb-5"
            style={{ backgroundColor: colors.surfaceContainerHighest }}
          >
            <MaterialIcons name="menu-book" size={56} color={colors.onSurfaceVariant} />
          </View>
        )}

        <Text
          className="text-2xl font-bold text-center px-8 mb-1"
          style={{ color: '#FFFFFF' }}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          className="text-base text-center px-8"
          style={{ color: 'rgba(255,255,255,0.8)' }}
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
