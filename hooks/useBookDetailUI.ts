import {useState} from 'react'

export const useBookDetailUI = () => {
    const [selectedListIds, setSelectedListIds] = useState<string[]>([])
    const [showProgressSlider, setShowProgressSlider] = useState(false)
    const [showRatingPicker, setShowRatingPicker] = useState(false)
    const [showListSelector, setShowListSelector] = useState(false)
    const [showRemoveDialog, setShowRemoveDialog] = useState(false)

    const toggleList = (listId: string) => {
        setSelectedListIds((prev) =>
            prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
        )
    }

    return {
        selectedListIds,
        showProgressSlider,
        setShowProgressSlider,
        showRatingPicker,
        setShowRatingPicker,
        showListSelector,
        setShowListSelector,
        showRemoveDialog,
        setShowRemoveDialog,
        toggleList,
    }
}
