import React, { useEffect } from 'react';
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
  // const web3Connect = useWeb3Connect();
  const router = useRouter();
  const classes = useStyles();

  //TODO: reinstate

  // useEffect(() => {
  //   if (web3Connect.network == web3Connect.supportedNetwork) {
  //     router.history.push('/');
  //   }
  // }, [web3Connect.network]);

  return (
    // <Page title={`dao.care | ${web3Connect.network} not supported`}>
    <Page title={`dao.care |  not supported`}>
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
            We are not yet supporting{' '}
            {/* {web3Connect.network ? web3Connect.network : <EllipsisLoader />},
            please connect to {web3Connect.supportedNetwork} */}
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
