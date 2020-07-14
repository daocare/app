import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useRouter from '../utils/useRouter';
import useWeb3Modal from '../utils/useWeb3Modal';
import { Typography } from '@material-ui/core';
import Page from '../components/Page';
import { makeStyles } from '@material-ui/styles';
import EllipsisLoader from '../components/EllipsisLoader';

const useStyles = makeStyles((theme) => ({
  pageCentered: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
}));

const NetworkNotSupported = () => {
  const web3Modal = useWeb3Modal();
  const router = useRouter();
  const classes = useStyles();

  const supportedNetworks = web3Modal.SUPPORTED_NETWORKS;

  const networkInfo = useSelector((state) => state.web3);

  useEffect(() => {
    if (supportedNetworks.includes(networkInfo.network)) {
      router.history.push('/');
    }
  }, [networkInfo.network]);

  return (
    <Page title={`dao.care | Network not supported`}>
      <div className={classes.pageCentered}>
        <div style={{ marginBottom: 16 }}>
          <Typography
            variant="body1"
            style={{
              marginTop: 16,
              textAlign: 'center',
              color: '#A362A5',
              fontWeight: 400,
            }}
          >
            We only support mainnet and{' '}
            <a href="https://kovan.onrender.com">kovan</a> please connect to{' '}
            {supportedNetworks.map((network, index) =>
              supportedNetworks.length > 1 && !index == 0
                ? ' or ' + network
                : network
            )}
          </Typography>
        </div>
        <div
          style={{
            marginTop: 32,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          <img
            style={{ maxWidth: '100%', maxHeight: 280 }}
            src="/network-not-supported.svg"
            alt="Network not supported"
          />
        </div>
      </div>
    </Page>
  );
};

export default NetworkNotSupported;
