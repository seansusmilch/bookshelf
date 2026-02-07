import {Card, CardContent} from '@/components/ui/Card'
import {InfoRow, Divider} from '@/components/ui/Section'

type BookMetaInfoProps = {
    pageCount?: number
    publishDate?: string
    publisher?: string
    isbn?: string
    language?: string
    className?: string
}

export const BookMetaInfo = ({
    pageCount,
    publishDate,
    publisher,
    isbn,
    language,
    className = '',
}: BookMetaInfoProps) => {
    const hasInfo = pageCount || publishDate || publisher || isbn || language

    if (!hasInfo) return null

    return (
        <Card variant="elevated" className={className}>
            <CardContent>
                {pageCount !== undefined && (
                    <>
                        <InfoRow icon="menu-book" label="Pages" value={pageCount.toString()} />
                        {(publishDate || publisher || isbn || language) && (
                            <Divider className="my-3" />
                        )}
                    </>
                )}

                {publishDate && (
                    <>
                        <InfoRow icon="event" label="Published" value={publishDate} />
                        {(publisher || isbn || language) && <Divider className="my-3" />}
                    </>
                )}

                {publisher && (
                    <>
                        <InfoRow icon="business" label="Publisher" value={publisher} />
                        {(isbn || language) && <Divider className="my-3" />}
                    </>
                )}

                {isbn && (
                    <>
                        <InfoRow icon="qr-code" label="ISBN" value={isbn} />
                        {language && <Divider className="my-3" />}
                    </>
                )}

                {language && <InfoRow icon="language" label="Language" value={language} />}
            </CardContent>
        </Card>
    )
}
