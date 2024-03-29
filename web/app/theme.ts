import { extendTheme, tabClasses } from '@mui/joy';

export const theme = extendTheme({
  spacing: 10,
  fontFamily: {
    display: 'Inter Variable',
    body: 'Inter Variable',
  },
  radius: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '22px',
  },
  components: {
    JoyCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '--Card-radius': theme.radius.lg,
          background: theme.palette.background.backdrop,
          backdropFilter: `blur(10px)`,
        }),
      },
    },
    JoyTabList: {
      defaultProps: {
        variant: 'plain',
        disableUnderline: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.spacing(0.25),
          borderRadius: theme.vars.radius.lg,
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
          borderRadius: theme.vars.radius.lg,
          background: theme.palette.background.backdrop,
          backdropFilter: `blur(10px)`,
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
