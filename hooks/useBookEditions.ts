import { useState, useCallback, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Edition, getEditionCoverUrl, processEditions } from '~/lib/openLibraryUtils';

type WorkDetails = {
  author: string;
  description: string | undefined;
};

type UseBookEditionsProps = {
  workId: string | undefined;
  authorFallback?: string;
  coverUrlFallback?: string;
  titleFallback?: string;
};

export const useBookEditions = ({
  workId: paramId,
  authorFallback,
  coverUrlFallback,
  titleFallback,
}: UseBookEditionsProps) => {
  const getWorkEditions = useAction(api.openLibrarySearch.getWorkEditions);
  const getBookDetails = useAction(api.openLibrarySearch.getBookDetails);
  const getWork = useAction(api.openLibrarySearch.getWork);

  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [allEditions, setAllEditions] = useState<Edition[]>([]);
  const [isEditionsLoading, setIsEditionsLoading] = useState(true);
  const [editionError, setEditionError] = useState<string | null>(null);
  const [workDetails, setWorkDetails] = useState<WorkDetails | null>(null);
  const [showWorkDetailsLoader, setShowWorkDetailsLoader] = useState(true);
  const [actualEditionId, setActualEditionId] = useState<string | undefined>(undefined);
  const [actualWorkId, setActualWorkId] = useState<string | undefined>(undefined);
  const [workTitle, setWorkTitle] = useState<string | undefined>(
    titleFallback ? decodeURIComponent(titleFallback) : undefined
  );

  const [initialCoverUrl] = useState<string | undefined>(
    coverUrlFallback ? decodeURIComponent(coverUrlFallback) : undefined
  );
  const [initialAuthor] = useState<string | undefined>(
    authorFallback ? decodeURIComponent(authorFallback) : undefined
  );

  const loadEditions = useCallback(async () => {
    try {
      setIsEditionsLoading(true);
      setEditionError(null);

      if (!paramId) {
        throw new Error('workId parameter is missing');
      }

      let actualWorkId: string = paramId;
      let editionId: string | undefined = undefined;

      const isEditionParam = paramId.match(/^OL\d+M$/);

      if (isEditionParam) {
        const olid = paramId.startsWith('/') ? paramId : `/books/${paramId}`;
        const edition = await getBookDetails({ openLibraryId: olid });

        if (edition.works && edition.works.length > 0) {
          actualWorkId = edition.works[0].key.split('/').pop() || paramId;
          editionId = paramId;
        } else {
          actualWorkId = paramId;
          editionId = undefined;
        }
      } else {
        actualWorkId = paramId;
        editionId = undefined;
      }

      setActualEditionId(editionId);
      setActualWorkId(actualWorkId);

      const editionsResponse = await getWorkEditions({
        openLibraryId: `/works/${actualWorkId}`,
        limit: 50,
      });

      const editions = editionsResponse.entries.map((entry: any): Edition => {
        const editionData: Edition = {
          key: entry.key,
          title: entry.title,
          pageCount: entry.number_of_pages,
          publishDate: entry.publish_date,
          coverUrl: undefined,
          isbn10: entry.isbn_10,
          isbn13: entry.isbn_13,
          publishers: entry.publishers,
          languages: entry.languages,
          covers: entry.covers,
          authors: entry.authors,
          physicalFormat: entry.physical_format,
        };
        editionData.coverUrl = getEditionCoverUrl(editionData);
        return editionData;
      });

      const workResponse = await getWork({ openLibraryId: `/works/${actualWorkId}` });
      if (workResponse?.title && !titleFallback) {
        setWorkTitle(workResponse.title);
      }

      const processedEditions = processEditions(editions);

      if (processedEditions.length === 0) {
        throw new Error('This book has no author information available');
      }

      const selected = processedEditions[0];

      setAllEditions(processedEditions);
      setSelectedEdition(selected);
    } catch (err) {
      setEditionError('Failed to load book editions. Please try again.');
    } finally {
      setIsEditionsLoading(false);
    }
  }, [paramId, getWorkEditions, getBookDetails, getWork, titleFallback]);

  const reload = useCallback(() => {
    loadEditions();
  }, [loadEditions]);

  useEffect(() => {
    loadEditions();
  }, [loadEditions]);

  return {
    allEditions,
    selectedEdition,
    isEditionsLoading,
    editionError,
    workDetails,
    showWorkDetailsLoader,
    actualWorkId,
    actualEditionId,
    workTitle,
    initialCoverUrl,
    initialAuthor,
    setSelectedEdition,
    setWorkDetails,
    setShowWorkDetailsLoader,
    reload,
  };
};
