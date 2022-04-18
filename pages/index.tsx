import type { NextPage } from 'next'
import { Container, Grid } from '@mui/material';

import ConnectWallet from '../components/ConnectWallet';
import SwapPanel from '../components/SwapPanel';

const Home: NextPage = () => {
  return (
    <Container>
      <ConnectWallet />
      <Grid
        container
        justifyContent='center'
        mt={10}
      >
        <Grid item xs={12} md={8} lg={6} xl={4}>
          <SwapPanel />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Home
