import React, { useEffect, useState } from 'react'

import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import IconDown from '@mui/icons-material/ArrowDownward'
import { LoadingButton } from '@mui/lab';

import CryptoInput from './CryptoInput'
import logoDai from '../assets/crypto/dai.png'
import logoEth from '../assets/crypto/eth.png'
import { useDaiSwap } from '../contexts/DaiSwapContext';
import { formatNumber } from '../utils/helper';
import { useWallet } from '../contexts/WalletContext';
import useNotification from '../hooks/useNotification';
import { ERROR_INSUFFICIENT_AMOUNT_DAI, ERROR_ZERO_DAI_AMOUNT } from '../const/messages';

const SwapPanel = () => {
  const { notifyError } = useNotification()
  const { provider, daiBalance, ethBalance } = useWallet()
  const { ethPrice, daiPrice, getEthOutput, getDaiOutput, swapDaiWithEth } = useDaiSwap()

  const [daiAmount, setDaiAmount] = useState('0.0')
  const [ethAmount, setEthAmount] = useState('0.0')
  const [isInSwap, setIsInSwap] = useState(false)

  const handleChangeDai = async (dai) => {
    setDaiAmount(dai)

    const ethOutput = await getEthOutput(Number(dai))
    setEthAmount(ethOutput > 0 ? String(ethOutput) : '0.0')
  }

  const handleChangeEth = async (eth) => {
    setEthAmount(eth)

    const daiOutput = await getDaiOutput(Number(eth))
    setDaiAmount(daiOutput > 0 ? String(daiOutput) : '0.0')
  }

  const handleSwap = async () => {
    const daiNumber = Number(daiAmount)

    if (daiNumber === 0) {
      notifyError(ERROR_ZERO_DAI_AMOUNT)
      return
    }

    if (daiNumber > daiBalance) {
      notifyError(ERROR_INSUFFICIENT_AMOUNT_DAI)
      return
    }

    setIsInSwap(true)

    await swapDaiWithEth(daiNumber)

    setIsInSwap(false)
  }

  // Update amount of ETH when the price of DAI is updated.
  useEffect(() => {
    if (daiPrice) {
      handleChangeDai(daiAmount)
    }
  }, [daiPrice])

  return (
    <Paper elevation={4}>
      <Grid container spacing={1} flexDirection="column">
        <Grid item>
          <Typography variant="h6" align="center">
            Swap DAI with ETH
          </Typography>
        </Grid>
        <Grid item sx={{ position: 'relative' }}>
          <Paper elevation={8} className="crypto-input-wrapper-DAI">
            <CryptoInput
              label="DAI"
              logoUrl={logoDai}
              amount={daiAmount}
              onChangeAmount={handleChangeDai}
            />
            {daiBalance !== null && (
              <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>
                <Typography align="right" variant="body2" color="text.disabled">
                  Balance: {formatNumber(daiBalance)}
                </Typography>
                <Chip
                  className="btn-swap-max-dai"
                  clickable
                  label="Max"
                  size="small"
                  onClick={() => handleChangeDai(daiBalance)}
                  sx={{ ml: 1 }}
                />
              </Box>
            )}
          </Paper>
          {/* TODO: Implement switching with clicking the button. */}
          <Button
            disabled
            size="small"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              minWidth: 0,
              transform: 'translate(-50%, -50%)',
              borderRadius: '100%',
              width: 24,
              height: 24
            }}
          >
            <IconDown />
          </Button>
        </Grid>
        <Grid item>
          <Paper elevation={8} className="crypto-input-wrapper-ETH">
            <CryptoInput
              label="ETH"
              logoUrl={logoEth}
              amount={ethAmount}
              onChangeAmount={handleChangeEth}
            />
            {ethBalance !== null && (
              <Typography align="right" variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Balance: {formatNumber(ethBalance)}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item>
          {ethPrice && (
            <Typography>
              1 ETH = {formatNumber(ethPrice)} DAI
            </Typography>
          )}
        </Grid>
        <Grid item>
          <LoadingButton
            className="btn-swap"
            variant="contained"
            size="large"
            fullWidth
            sx={{ borderRadius: 3 }}
            disabled={!provider}
            loading={isInSwap}
            onClick={handleSwap}
          >
            Swap
          </LoadingButton>
          {!provider  && (
            <Typography align="center" color="error" sx={{ mt: 1 }}>
              Please connect wallet to use swap.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SwapPanel
