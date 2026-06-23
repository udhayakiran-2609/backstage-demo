import { createUnifiedTheme, palettes } from '@backstage/theme';

export const myTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    navigation: {
      background: '#ffffff',
      color: '#374151',
      selectedColor: '#2563EB',
      indicator: '#2563EB',
    },
  },

  fontFamily: 'Comic Sans MS',
  defaultPageTheme: 'home',
});