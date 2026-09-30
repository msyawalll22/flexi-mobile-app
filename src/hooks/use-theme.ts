import { useColorScheme } from 'react-native';
import { Colors, COLORS, Spacing, Radius, Fonts } from '@/constants/theme';

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: theme,
    brand: COLORS,
    spacing: Spacing,
    radius: Radius,
    fonts: Fonts,
  };
}