import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button, Grid } from '@material-ui/core';
import useWeb3Connect from '../utils/useWeb3Connect';
import useRouter from '../utils/useRouter';
import useInterval from '../utils/useInterval';

import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DepositIcon from '@material-ui/icons/AllInclusive';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';

const useStyles = makeStyles((theme) => ({
  gridContainer: { margin: '0.2rem 0' },
  gridItemNumber: {
    textAlign: 'right',
    padding: '0 5px !important',
  },
  gridItem: {
    textAlign: 'left',
    padding: '0 5px !important',
  },
  numberHighlight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A362A5',
    display: 'inline',
  },
  stepExplainerHeader: {
    fontSize: 22,
    color: '#6850A8',
    fontWeight: 'bold',
  },
  stepExplainer: {},
}));

const HowItWorks = () => {
  const classes = useStyles();

  return (
    <>
      <Header />
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        <Grid item xs={1} md={1} className={classes.gridItemNumber}>
          <Typography variant="body1" className={classes.numberHighlight}>
            1.
          </Typography>
        </Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography className={classes.stepExplainerHeader}>
            Join the fund
          </Typography>
        </Grid>
        <Grid item xs={1} md={1} className={classes.gridItem}></Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography variant="body1" className={classes.stepExplainer}>
            Deposit DAI into the fund to be part of the DAO. The more you
            deposit the more voting power you receive.
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        <Grid item xs={1} md={1} className={classes.gridItemNumber}>
          <Typography variant="body1" className={classes.numberHighlight}>
            2.
          </Typography>
        </Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography className={classes.stepExplainerHeader}>
            The fund earns interest
          </Typography>
        </Grid>
        <Grid item xs={1} md={1} className={classes.gridItem}></Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography variant="body1" className={classes.stepExplainer}>
            Interest accrues on the DAI in the fund.
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        <Grid item xs={1} md={1} className={classes.gridItemNumber}>
          <Typography variant="body1" className={classes.numberHighlight}>
            3.
          </Typography>
        </Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography className={classes.stepExplainerHeader}>Vote</Typography>
        </Grid>
        <Grid item xs={1} md={1} className={classes.gridItem}></Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography variant="body1" className={classes.stepExplainer}>
            Vote on the proposal you feel is most worthy of receiving the
            interest
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        <Grid item xs={1} md={1} className={classes.gridItemNumber}>
          <Typography variant="body1" className={classes.numberHighlight}>
            4.
          </Typography>
        </Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography className={classes.stepExplainerHeader}>
            Winner
          </Typography>
        </Grid>
        <Grid item xs={1} md={1} className={classes.gridItem}></Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography variant="body1" className={classes.stepExplainer}>
            At the end of each two week round the proposal with the most votes
            receives the interest from the fund.
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        <Grid item xs={1} md={1} className={classes.gridItemNumber}>
          <Typography variant="body1" className={classes.numberHighlight}>
            5.
          </Typography>
        </Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography className={classes.stepExplainerHeader}>
            Withdraw all your funds
          </Typography>
        </Grid>
        <Grid item xs={1} md={1} className={classes.gridItem}></Grid>
        <Grid item xs={11} md={11} className={classes.gridItem}>
          <Typography variant="body1" className={classes.stepExplainer}>
            At any point if you want to leave. You can withdraw all of your DAI
            from the fund
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default HowItWorks;
