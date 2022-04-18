import { FC } from 'react'
import { Box, Button, Chip, Grid, Typography } from '@mui/material'

import { useWallet } from '../contexts/WalletContext'
import { formatNumber, shortenWalletAddress } from '../utils/helper';

const ConnectWallet: FC = () => {
  const { ready, walletAddress, connect, ethBalance, daiBalance } = useWallet()

  if (!ready) {
    return (
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={connect}>
          Connect Wallet
        </Button>
      </Box>
    )
  }

  return (
    <Grid container spacing={1} justifyContent="flex-end">
      <Grid item>
        {ethBalance && (
          <Chip
            clickable
            variant="outlined"
            label={(
              <Typography variant="h6">
                {formatNumber(ethBalance)} ETH
              </Typography>
            )}
          />
        )}
      </Grid>
      <Grid item>
        {daiBalance && (
          <Chip
            clickable
            variant="outlined"
            label={(
              <Typography variant="h6">
                {formatNumber(daiBalance)} DAI
              </Typography>
            )}
          />
        )}
      </Grid>
      <Grid item>
        <Chip
          clickable
          variant="outlined"
          label={(
            <Typography variant="h6">
              {shortenWalletAddress(walletAddress!)}
            </Typography>
          )}
        />
      </Grid>
    </Grid>
  )
}

export default ConnectWallet
