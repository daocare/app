import React from 'react';

import { makeStyles } from '@material-ui/styles';

import { Typography, Button, Grid } from '@material-ui/core';

import Page from '../components/Page';
import Header from '../components/Header';

const useStyles = makeStyles((theme) => ({
  securityContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
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
        <Grid item xs={12} md={4} className={classes.gridItem}>
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
              Dit craft v1 audit
            </a>
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} className={classes.gridItem}>
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
              Github code
            </a>
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} className={classes.gridItem}>
          <a href="#" target="_blank" rel="noopener noreferrer">
            {/* TODO */}
            <img
              src="/assets/security/etherscan.svg"
              className={classes.socials}
            />
          </a>

          <Typography variant="body2">
            <a href="#" target="_blank" rel="noopener noreferrer">
              {/* TODO Here too */}
              Etherscan Code Verification
            </a>
          </Typography>
        </Grid>
      </Grid>
    </Page>
  );
};

export default Security;
