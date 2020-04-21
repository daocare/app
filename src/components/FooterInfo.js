import React from 'react';
import { Typography } from '@material-ui/core';

const FooterInfo = (props) => {
  return (
    <Typography
      variant="caption"
      color="secondary"
      style={{ position: 'absolute', bottom: '10px' }}
    >
      We are currently running on Kovan network. Please get DAI from Aave{' '}
      <a
        href="https://testnet.aave.com/faucet/DAI"
        target="_blank"
        rel="noopener noreferrer"
      >
        test app
      </a>
      .
    </Typography>
  );
};

export default FooterInfo;
