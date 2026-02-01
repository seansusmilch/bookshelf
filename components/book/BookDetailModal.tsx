import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { View, Text, Pressable, ScrollView, Image } from '@/tw';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { ProgressSlider } from '../ui/ProgressSlider';
import { RatingPicker } from '../ui/RatingPicker';
import { ListSelector } from '../ui/ListSelector';
import { useCompleteBook } from '../../hooks/useCompleteBook';
import { useCreateList } from '../../hooks/useCreateList';
import { useRateBook } from '../../hooks/useRateBook';
import { useUpdateProgress } from '../../hooks/useUpdateProgress';
import { Id } from 'convex/_generated/dataModel';

type BookDetail = {
  _id: Id<'books'>;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  status: string;
  rating?: { rating: number };
};

type BookDetailModalProps = {
  visible: boolean;
  bookId: string | null;
  onClose: () => void;
};

export const BookDetailModal = ({ visible, bookId, onClose }: BookDetailModalProps) => {
  const bookDetail = useQuery(
    api.books.getBookById,
    bookId ? { bookId: bookId as any } : 'skip'
  );
  const lists = useQuery(api.lists.getUserLists, {});
  const updateProgress = useUpdateProgress();
  const rateBook = useRateBook();
  const completeBook = useCompleteBook();
  const createList = useCreateList();

  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [showProgressSlider, setShowProgressSlider] = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const book = bookDetail as BookDetail | null | undefined;

  useEffect(() => {
    if (bookId === undefined || bookId === null || bookId === '') {
      setIsLoading(false);
    } else if (bookDetail !== undefined) {
      setIsLoading(false);
    }
  }, [bookId, bookDetail]);

  if (!visible) return null;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-gray-900">Book not found</Text>
        <Text className="text-center text-gray-600 text-sm mt-2">
          This book may have been deleted or you don&apos;t have access to it.
        </Text>
      </View>
    );
  }

  const handleProgressUpdate = (newPage: number) => {
    updateProgress.mutate({ bookId: book._id, currentPage: newPage });
    setShowProgressSlider(false);
  };

  const handleRatingUpdate = (rating: number) => {
    rateBook.mutate({ bookId: book._id, rating });
    setShowRatingPicker(false);
  };

  const handleComplete = () => {
    completeBook.mutate(book._id);
  };

  const handleCreateList = (name: string) => {
    createList.mutate(name);
  };

  const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  return (
    <View className="flex-1 bg-white">
      <View className="relative">
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-full h-72"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-72 bg-gray-100 items-center justify-center">
            <Text className="text-gray-400">No cover available</Text>
          </View>
        )}
        <Pressable
          onPress={onClose}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">✕</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">{book.title}</Text>
        <Text className="text-base text-gray-600 mb-4">{book.author}</Text>

        {book.description && (
          <Text className="text-sm text-gray-700 leading-relaxed mb-4">{book.description}</Text>
        )}

        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Status</Text>
            <Text className="text-sm font-semibold text-gray-900 capitalize">
              {book.status.replace('_', ' ')}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Progress</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {book.currentPage} / {book.totalPages} pages
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        {book.rating && (
          <View className="mb-4 flex-row items-center gap-2">
            <Text className="text-3xl">⭐</Text>
            <Text className="text-lg font-semibold text-gray-900">{book.rating.rating}/10</Text>
          </View>
        )}

        {showProgressSlider && (
          <ProgressSlider
            value={book.currentPage}
            max={book.totalPages}
            onChange={handleProgressUpdate}
          />
        )}

        {showRatingPicker && (
          <RatingPicker
            value={book.rating?.rating}
            onChange={handleRatingUpdate}
          />
        )}

        {lists && lists.length > 0 && (
          <ListSelector
            lists={lists}
            selectedListIds={selectedListIds}
            onSelectionChange={setSelectedListIds}
            onCreateList={handleCreateList}
          />
        )}

        <View className="flex-row gap-3 mt-6">
          {!showProgressSlider && book.status !== 'completed' && (
            <Pressable
              onPress={() => setShowProgressSlider(true)}
              className="flex-1 py-3 bg-blue-500 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Update Progress</Text>
            </Pressable>
          )}

          {!showRatingPicker && (
            <Pressable
              onPress={() => setShowRatingPicker(true)}
              className="flex-1 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-gray-700 text-center font-semibold">Rate</Text>
            </Pressable>
          )}

          {book.status !== 'completed' && (
            <Pressable
              onPress={handleComplete}
              className="flex-1 py-3 bg-green-500 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Mark Complete</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
