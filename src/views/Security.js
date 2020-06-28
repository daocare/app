import React from 'react';

import { makeStyles } from '@material-ui/styles';

import { Typography, Button, Grid } from '@material-ui/core';

import Page from '../components/Page';
import Header from '../components/Header';

const useStyles = makeStyles((theme) => ({
  securityContainer: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  gridItem: {
    textAlign: 'center',
  },
  socials: {
    height: '120px',
    padding: '15px',
    '&:hover': {
      opacity: '0.6',
    },
  },
}));

const Security = () => {
  const classes = useStyles();

  return (
    <Page title="dao.care | Security">
      <Header />
      <Typography variant="h5">Security</Typography>

      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.securityContainer}
      >
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a
            href="/dao.care_smart_contract_audit.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/security/ditcraft.svg"
              className={classes.socials}
            />{' '}
          </a>

          <Typography variant="body2">
            <a
              href="/dao.care_smart_contract_audit.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              ditCraft v1 Audit
            </a>
          </Typography>
        </Grid>
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a href="/coverage" target="_blank" rel="noopener noreferrer">
            <img src="/assets/security/tests.svg" className={classes.socials} />
          </a>

          <Typography variant="body2">
            <a href="/coverage" target="_blank" rel="noopener noreferrer">
              Smart Contract Coverage
            </a>
          </Typography>
        </Grid>
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a
            href="https://github.com/DAOcare"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/security/github.svg"
              className={classes.socials}
            />
          </a>

          <Typography variant="body2">
            <a
              href="https://github.com/DAOcare"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github Code
            </a>
          </Typography>
        </Grid>
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a
            href="https://etherscan.io/address/0xac523606b34240a1d6c90cf1223f1b75136a14d1#code"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/security/etherscan.svg"
              className={classes.socials}
            />
          </a>
          <Typography variant="body2">
            <a
              href="https://etherscan.io/address/0xac523606b34240a1d6c90cf1223f1b75136a14d1#code"
              target="_blank"
              rel="noopener noreferrer"
            >
              No Loss DAO Proxy
            </a>
          </Typography>
        </Grid>
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a
            href="https://etherscan.io/address/0xc2e6624dd7535fea0b1c3829bef7e87153e35c3a#code"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/security/etherscan.svg"
              className={classes.socials}
            />
          </a>
          <Typography variant="body2">
            <a
              href="https://etherscan.io/address/0xc2e6624dd7535fea0b1c3829bef7e87153e35c3a#code"
              target="_blank"
              rel="noopener noreferrer"
            >
              No Loss DAO
            </a>
          </Typography>
        </Grid>
        <Grid item xs={6} md={4} className={classes.gridItem}>
          <a
            href="https://etherscan.io/address/0x46441594290FC13e97dD2E2A9Cf49E114599bc38#code"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/security/etherscan.svg"
              className={classes.socials}
            />
          </a>
          <Typography variant="body2">
            <a
              href="https://etherscan.io/address/0x46441594290FC13e97dD2E2A9Cf49E114599bc38#code"
              target="_blank"
              rel="noopener noreferrer"
            >
              Deposit Pool
            </a>
          </Typography>
        </Grid>
      </Grid>
    </Page>
  );
};

export default Security;
