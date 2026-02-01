import { View, Text, Pressable } from '@/tw';
import { useState } from 'react';

type AddBookSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (status: string, listId?: string) => void;
  pageCount?: number;
};

const STATUS_OPTIONS = [
  { value: 'want_to_read', label: 'Want to Read', icon: '📚' },
  { value: 'reading', label: 'Currently Reading', icon: '📖' },
  { value: 'completed', label: 'Completed', icon: '✅' },
];

export const AddBookSheet = ({ visible, onClose, onAdd, pageCount }: AddBookSheetProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('want_to_read');

  if (!visible) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-gray-900">Add to Your Library</Text>
        <Pressable onPress={onClose}>
          <Text className="text-2xl text-gray-400">✕</Text>
        </Pressable>
      </View>

      {pageCount && pageCount > 0 && (
        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Text className="text-sm text-gray-600">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </View>
      )}

      <Text className="text-sm text-gray-600 mb-3">Select reading status</Text>
      <View className="gap-3 mb-6">
        {STATUS_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSelectedStatus(option.value)}
            className={`flex-row items-center gap-4 p-4 rounded-xl border-2 ${
              selectedStatus === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text className="text-2xl">{option.icon}</Text>
            <Text className="flex-1 text-base font-medium text-gray-900">
              {option.label}
            </Text>
            {selectedStatus === option.value && (
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => onAdd(selectedStatus)}
        className="py-4 bg-blue-500 rounded-xl"
      >
        <Text className="text-white text-center font-semibold text-base">Add Book</Text>
      </Pressable>
    </View>
  );
};
