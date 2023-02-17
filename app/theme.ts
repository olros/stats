import { extendTheme } from '@mui/joy';

export const theme = extendTheme({
  spacing: 10,
  components: {
    JoyCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    JoyTabList: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});
