import {View, Text, Pressable, TextInput} from 'react-native'
import {useState} from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {useAppTheme} from '@/components/material3-provider'

type List = {
    _id: string
    name: string
}

type ListSelectorProps = {
    lists: List[]
    selectedListIds: string[]
    onSelectionChange: (listIds: string[]) => void
    onCreateList: (name: string) => void
}

export const ListSelector = ({
    lists,
    selectedListIds,
    onSelectionChange,
    onCreateList,
}: ListSelectorProps) => {
    const [showNewList, setShowNewList] = useState(false)
    const [newListName, setNewListName] = useState('')
    const {colors} = useAppTheme()

    const toggleList = (listId: string) => {
        if (selectedListIds.includes(listId)) {
            onSelectionChange(selectedListIds.filter((id) => id !== listId))
        } else {
            onSelectionChange([...selectedListIds, listId])
        }
    }

    const handleCreateList = () => {
        if (newListName.trim()) {
            onCreateList(newListName.trim())
            setNewListName('')
            setShowNewList(false)
        }
    }

    return (
        <View className="rounded-lg px-4 py-3" style={{backgroundColor: colors.surface}}>
            <Text className="mb-3 text-sm" style={{color: colors.onSurfaceVariant}}>
                Add to lists
            </Text>

            <View className="gap-2">
                {lists.map((list) => (
                    <Pressable
                        key={list._id}
                        onPress={() => toggleList(list._id)}
                        className="flex-row items-center justify-between rounded-lg p-3"
                        style={{backgroundColor: colors.surfaceContainerHighest}}>
                        <Text className="text-sm" style={{color: colors.onSurface}}>
                            {list.name}
                        </Text>
                        <FontAwesome
                            name={selectedListIds.includes(list._id) ? 'check-square' : 'square-o'}
                            size={20}
                            color={
                                selectedListIds.includes(list._id) ? colors.primary : colors.outline
                            }
                        />
                    </Pressable>
                ))}
            </View>

            {showNewList ? (
                <View className="mt-3 gap-2">
                    <TextInput
                        className="rounded-lg px-3 py-2 text-sm"
                        placeholder="List name"
                        value={newListName}
                        onChangeText={setNewListName}
                        autoFocus
                        onSubmitEditing={handleCreateList}
                        style={{
                            backgroundColor: colors.surfaceContainerHighest,
                            color: colors.onSurface,
                        }}
                        placeholderTextColor={colors.onSurfaceVariant}
                    />
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={handleCreateList}
                            className="flex-1 rounded-lg py-2"
                            style={{backgroundColor: colors.primary}}>
                            <Text className="text-center text-sm font-semibold text-white">
                                Create
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowNewList(false)
                                setNewListName('')
                            }}
                            className="flex-1 rounded-lg py-2"
                            style={{backgroundColor: colors.surfaceContainerHighest}}>
                            <Text
                                className="text-center text-sm font-semibold"
                                style={{color: colors.onSurface}}>
                                Cancel
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <Pressable
                    onPress={() => setShowNewList(true)}
                    className="mt-3 rounded-lg border-2 border-dashed p-3"
                    style={{borderColor: colors.outline}}>
                    <Text className="text-center text-sm" style={{color: colors.onSurfaceVariant}}>
                        + Create new list
                    </Text>
                </Pressable>
            )}
        </View>
    )
}
