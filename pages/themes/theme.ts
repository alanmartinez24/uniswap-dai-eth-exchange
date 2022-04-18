import { createTheme } from '@mui/material'
import type {} from '@mui/lab/themeAugmentation'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          padding: 16
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          padding: 12,
          borderRadius: 16
        }
      }
    }
  }
})

export default darkTheme
