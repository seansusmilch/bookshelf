import { View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type List = {
  _id: string;
  name: string;
};

type ListSelectorProps = {
  lists: List[];
  selectedListIds: string[];
  onSelectionChange: (listIds: string[]) => void;
  onCreateList: (name: string) => void;
};

export const ListSelector = ({
  lists,
  selectedListIds,
  onSelectionChange,
  onCreateList,
}: ListSelectorProps) => {
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const toggleList = (listId: string) => {
    if (selectedListIds.includes(listId)) {
      onSelectionChange(selectedListIds.filter((id) => id !== listId));
    } else {
      onSelectionChange([...selectedListIds, listId]);
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setShowNewList(false);
    }
  };

  return (
    <View className="px-4 py-3 bg-white rounded-lg">
      <Text className="text-sm text-gray-600 mb-3">Add to lists</Text>

      <View className="gap-2">
        {lists.map((list) => (
          <Pressable
            key={list._id}
            onPress={() => toggleList(list._id)}
            className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <Text className="text-sm text-gray-900">{list.name}</Text>
            <FontAwesome
              name={selectedListIds.includes(list._id) ? 'check-square' : 'square-o'}
              size={20}
              color={selectedListIds.includes(list._id) ? '#3b82f6' : '#9ca3af'}
            />
          </Pressable>
        ))}
      </View>

      {showNewList ? (
        <View className="mt-3 gap-2">
          <TextInput
            className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900"
            placeholder="List name"
            value={newListName}
            onChangeText={setNewListName}
            autoFocus
            onSubmitEditing={handleCreateList}
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleCreateList}
              className="flex-1 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-sm text-white text-center font-semibold">Create</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowNewList(false);
                setNewListName('');
              }}
              className="flex-1 py-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-sm text-gray-700 text-center font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setShowNewList(true)}
          className="mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg"
        >
          <Text className="text-sm text-gray-500 text-center">+ Create new list</Text>
        </Pressable>
      )}
    </View>
  );
};
