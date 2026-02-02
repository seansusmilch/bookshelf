import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useAppTheme } from '@/components/material3-provider';

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

const getDescriptionText = (desc: string | { type?: string; value: string } | undefined): string => {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  return desc.value || '';
};

type BookDescriptionProps = {
  description?: string | { type?: string; value: string };
  className?: string;
};

export const BookDescription = ({ description, className = '' }: BookDescriptionProps) => {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const descText = stripHtml(getDescriptionText(description));
  const shouldTruncate = descText.length > 300;
  const displayText = shouldTruncate && !expanded ? descText.slice(0, 300) + '...' : descText;

  if (!description) return null;

  return (
    <View className={className}>
      <Text
        className="text-base leading-relaxed"
        style={{ color: colors.onSurfaceVariant }}
      >
        {displayText}
      </Text>
      {shouldTruncate && (
        <Pressable onPress={() => setExpanded(!expanded)} className="mt-2">
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.primary }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
