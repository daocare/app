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

  const securityItems = [
    {
      link: 'https://youtu.be/Idin9MEELJs',
      imageSrc: 'youtube.svg',
      blurb: 'Contract Walkthrough',
    },
    {
      link: '/dao.care_smart_contract_audit.pdf',
      imageSrc: 'ditcraft.svg',
      blurb: 'ditCraft v1 Audit',
    },
    {
      link: '/coverage',
      imageSrc: 'tests.svg',
      blurb: 'Smart Contract Coverage',
    },
    {
      link: 'https://github.com/DAOcare',
      imageSrc: 'github.svg',
      blurb: 'Github Code',
    },
    {
      link:
        'https://etherscan.io/address/0xac523606b34240a1d6c90cf1223f1b75136a14d1#code',
      imageSrc: 'etherscan.svg',
      blurb: 'No Loss DAO Proxy',
    },
    {
      link:
        'https://etherscan.io/address/0xc2e6624dd7535fea0b1c3829bef7e87153e35c3a#code',
      imageSrc: 'etherscan.svg',
      blurb: 'No Loss DAO',
    },
    {
      link:
        'https://etherscan.io/address/0x46441594290FC13e97dD2E2A9Cf49E114599bc38#code',
      imageSrc: 'etherscan.svg',
      blurb: 'Deposit Pool',
    },
  ];

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
        {securityItems.map((securityItem) => (
          <Grid item xs={4} md={3} className={classes.gridItem}>
            <a
              href={securityItem.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`/assets/security/${securityItem.imageSrc}`}
                className={classes.socials}
              />{' '}
            </a>

            <Typography variant="body2">
              <a
                href={securityItem.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {securityItem.blurb}
              </a>
            </Typography>
          </Grid>
        ))}
        <Grid item xs={4} md={3} className={classes.gridItem}></Grid>
        <Grid item xs={4} md={3} className={classes.gridItem}></Grid>
        <Grid item xs={4} md={3} className={classes.gridItem}></Grid>
      </Grid>
    </Page>
  );
};

export default Security;
