import { View, Text, Image } from '@/tw';
import { useState } from 'react';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomSheet, BottomSheetListItem } from '@/components/ui/BottomSheet';
import { Card, CardContent } from '@/components/ui/Card';

type Edition = {
  key: string;
  title: string;
  pageCount?: number;
  publishDate?: string;
  coverUrl?: string;
  isbn10?: string[];
  isbn13?: string[];
  publishers?: { name: string }[];
};

type EditionSelectorProps = {
  currentEdition: Edition;
  allEditions: Edition[];
  onEditionChange: (edition: Edition) => void;
  className?: string;
};

export const EditionSelector = ({
  currentEdition,
  allEditions,
  onEditionChange,
  className = '',
}: EditionSelectorProps) => {
  const { colors } = useAppTheme();
  const [showSheet, setShowSheet] = useState(false);
  const editionsToShow = allEditions.slice(0, 50);

  const getEditionCover = (edition: Edition): string | undefined => {
    return edition.coverUrl;
  };

  return (
    <View className={className}>
      <Card
        variant="outlined"
        onPress={() => setShowSheet(true)}
        className="mb-2"
      >
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            {getEditionCover(currentEdition) ? (
              <Image
                source={{ uri: getEditionCover(currentEdition) }}
                className="w-16 h-24 rounded-lg bg-gray-200"
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
                className="text-base font-medium mb-1"
                style={{ color: colors.onSurface }}
                numberOfLines={1}
              >
                {currentEdition.title}
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.onSurfaceVariant }}
              >
                {currentEdition.pageCount ? `${currentEdition.pageCount} pages` : 'Page count unknown'}
              </Text>
              {currentEdition.publishDate && (
                <Text
                  className="text-sm"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {currentEdition.publishDate}
                </Text>
              )}
            </View>

            <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </View>
        </CardContent>
      </Card>

      <BottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        title="Select Edition"
        subtitle={`${editionsToShow.length} editions available`}
        maxHeight={500}
      >
        <View className="gap-3">
          {editionsToShow.map((edition) => {
            const isSelected = edition.key === currentEdition.key;
            const coverUrl = getEditionCover(edition);

            return (
              <BottomSheetListItem
                key={edition.key}
                title={edition.title}
                subtitle={`${edition.pageCount ? `${edition.pageCount} pages` : 'Page count unknown'}${edition.publishDate ? ` • ${edition.publishDate}` : ''}`}
                icon={
                  coverUrl ? (
                    <Image
                      source={{ uri: coverUrl }}
                      className="w-12 h-16 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className="w-12 h-16 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.surfaceContainerHighest }}
                    >
                      <MaterialIcons name="menu-book" size={20} color={colors.onSurfaceVariant} />
                    </View>
                  )
                }
                selected={isSelected}
                onPress={() => {
                  onEditionChange(edition);
                  setShowSheet(false);
                }}
              />
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
};
