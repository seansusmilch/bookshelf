import { View } from '@/tw';
import { useEffect, useCallback, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { InlineLoading } from '@/components/ui/StateComponents';

type WorkDetailLoaderProps = {
  workId: string;
  onLoad: (data: { author: string; description?: string }) => void;
  onError: (error: string) => void;
};

export const WorkDetailLoader = ({ workId, onLoad, onError }: WorkDetailLoaderProps) => {
  const getBookDetails = useAction(api.openLibrarySearch.getBookDetails);
  const [hasLoaded, setHasLoaded] = useState(false);

  console.log('🔍 [WorkDetailLoader] Component rendered with workId:', workId);

  const loadWorkDetails = useCallback(async () => {
    console.log('🔍 [WorkDetailLoader] loadWorkDetails called with workId:', workId);
    try {
      console.log('🔍 [WorkDetailLoader] Calling getBookDetails...');
      const book = await getBookDetails({ openLibraryId: workId });
      console.log('🔍 [WorkDetailLoader] getBookDetails response:', book);

      let author = 'Unknown Author';
      if (book.authors && book.authors.length > 0) {
        author = book.authors[0].name;
        console.log('🔍 [WorkDetailLoader] Author found:', author);
      }

      let description: string | undefined = undefined;
      if (book.description) {
        description = typeof book.description === 'string' ? book.description : book.description.value;
        console.log('🔍 [WorkDetailLoader] Description found, length:', description?.length);
      }

      console.log('🔍 [WorkDetailLoader] Calling onLoad with data');
      onLoad({ author, description });
      setHasLoaded(true);
    } catch (error) {
      console.error('🔍 [WorkDetailLoader] Error:', error);
      onError('Failed to load book details. Please try again.');
    }
  }, [workId, getBookDetails, onLoad, onError]);

  useEffect(() => {
    console.log('🔍 [WorkDetailLoader] useEffect triggered');
    loadWorkDetails();
  }, [workId, loadWorkDetails]);

  if (hasLoaded) {
    console.log('🔍 [WorkDetailLoader] Already loaded, returning null');
    return null;
  }

  console.log('🔍 [WorkDetailLoader] Rendering loading state');
  return (
    <View className="py-8">
      <InlineLoading message="Loading book details..." />
    </View>
  );
};
