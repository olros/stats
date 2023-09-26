import { extendTheme, tabClasses } from '@mui/joy';

export const theme = extendTheme({
  spacing: 10,
  fontFamily: {
    display: 'Public Sans',
    body: 'Public Sans',
  },
  components: {
    JoyCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    JoyTabList: {
      defaultProps: {
        variant: 'plain',
        disableUnderline: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.spacing(0.5),
          borderRadius: theme.vars.radius.lg,
          padding: 0,
        }),
      },
    },
    JoyTabs: {
      defaultProps: {
        size: 'lg',
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.neutral.outlinedBorder}`,
          padding: theme.spacing(0.25),
          borderRadius: theme.vars.radius.lg,
          [`& .${tabClasses.root}`]: {
            whiteSpace: 'nowrap',
            transition: '0.3s',
            fontWeight: theme.fontWeight.md,
            flex: 1,
            [`&:not(.${tabClasses.selected}):not(:hover)`]: {
              opacity: 0.72,
            },
          },
        }),
      },
    },
    JoyTab: {
      defaultProps: {
        disableIndicator: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.vars.radius.lg,
          [`&.${tabClasses.selected}`]: {
            backgroundColor: theme.palette.primary.plainActiveBg,
            color: theme.palette.primary.plainColor,
          },
        }),
      },
    },
  },
});
