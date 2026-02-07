import {View} from 'react-native'
import {Card, CardContent} from '@/components/ui/Card'
import {RadioGroup} from '@/components/ui/Chips'

const STATUS_OPTIONS = [
    {value: 'want_to_read', label: 'Want to Read'},
    {value: 'reading', label: 'Currently Reading'},
    {value: 'completed', label: 'Completed'},
]

type StatusSelectorProps = {
    selectedStatus: string
    onStatusChange: (status: string) => void
    className?: string
}

export const StatusSelector = ({
    selectedStatus,
    onStatusChange,
    className = '',
}: StatusSelectorProps) => {
    return (
        <View className={className}>
            <Card variant="outlined">
                <CardContent>
                    <RadioGroup
                        options={STATUS_OPTIONS}
                        value={selectedStatus}
                        onChange={onStatusChange}
                    />
                </CardContent>
            </Card>
        </View>
    )
}
