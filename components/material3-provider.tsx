import { Material3Scheme, Material3Theme, useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, useTheme } from 'react-native-paper';

type Material3ProviderContextType = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
};

const Material3ProviderContext = createContext<Material3ProviderContextType>(
  {} as Material3ProviderContextType,
);

export function useAppTheme() {
  return useTheme<typeof MD3DarkTheme & { colors: Material3Scheme }>();
}

export function useMaterial3ThemeContext() {
  const ctx = useContext(Material3ProviderContext);
  if (!ctx) {
    throw new Error('useMaterial3ThemeContext must be used inside Material3Provider');
  }
  return ctx;
}

interface Material3ProviderProps {
  children: React.ReactNode;
  sourceColor?: string;
  fallbackSourceColor?: string;
}

export function Material3Provider({ children, sourceColor, fallbackSourceColor }: Material3ProviderProps) {
  const colorScheme = useColorScheme();

  const { theme, updateTheme, resetTheme } = useMaterial3Theme({
    sourceColor,
    fallbackSourceColor,
  });

  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };

  return (
    <Material3ProviderContext.Provider value={{ theme, updateTheme, resetTheme }}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </Material3ProviderContext.Provider>
  );
}
