import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { WalletContextProvider } from '../contexts/WalletContext';
import theme from './themes/theme';
import { DaiSwapContextProvider } from '../contexts/DaiSwapContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <WalletContextProvider>
          <DaiSwapContextProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </DaiSwapContextProvider>
        </WalletContextProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default MyApp
