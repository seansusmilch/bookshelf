import * as WebBrowser from 'expo-web-browser'
import {useEffect} from 'react'
import {Platform} from 'react-native'

export const useWarmUpBrowser = () => {
    if (Platform.OS === 'web') return

    useEffect(() => {
        WebBrowser.warmUpAsync?.()
        return () => {
            WebBrowser.coolDownAsync?.()
        }
    }, [])
}
