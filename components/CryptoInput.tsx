import React, { ChangeEvent, FC } from 'react'
import Image, { StaticImageData } from 'next/image'

import { Avatar, Box, InputBase } from '@mui/material';

import { useWallet } from '../contexts/WalletContext';

interface CryptoInputProps {
  label: string;
  logo: StaticImageData;
  amount: string;
  onChangeAmount: (amount: string) => void;
}

const CryptoInput: FC<CryptoInputProps> = ({ amount, onChangeAmount, label, logo }) => {
  const { provider } = useWallet()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
        disabled={!provider}
        inputProps={{
          className: `crypto-input-${label}`
        }}
      />
      <Avatar>
        <Image src={logo} alt={label} />
      </Avatar>
    </Box>
  )
}

export default CryptoInput
