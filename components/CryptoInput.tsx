import React, { ChangeEvent, FC } from 'react'
import Image from 'next/image'

import { Avatar, Box, InputBase } from '@mui/material';

import { useDaiSwap } from '../contexts/DaiSwapContext';

interface CryptoInputProps {
  label: string;
  logoUrl: string;
  amount: string;
  onChangeAmount: (amount: string) => void;
}

const CryptoInput: FC<CryptoInputProps> = ({ amount, onChangeAmount, label, logoUrl }) => {
  const { ready } = useDaiSwap()

  const handleChange = (event: ChangeEvent) => {
    const value = Number(event.target.value)

    if (value >= 0) {
      onChangeAmount(event.target.value)
    }
  }

  return (
    <Box display="flex" alignItems="center">
      <InputBase
        fullWidth
        onChange={handleChange}
        value={amount}
        sx={{ flex: 1, mr: 1, fontSize: 24 }}
        disabled={!ready}
      />
      <Avatar>
        <Image src={logoUrl} alt={label} />
      </Avatar>
    </Box>
  )
}

export default CryptoInput
