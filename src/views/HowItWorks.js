import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import {
  Typography,
  Button,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@material-ui/core';

import useRouter from '../utils/useRouter';
import useInterval from '../utils/useInterval';

import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DepositIcon from '@material-ui/icons/AllInclusive';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';

const useStyles = makeStyles((theme) => ({
  // gridContainer: { margin: '0.2rem 0' },
  gridItemNumber: {
    textAlign: 'right',
    padding: '0 5px !important',
  },
  gridItem: {
    textAlign: 'left',
    padding: '10px 5px !important',
  },
  numberHighlight: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#A362A5',
    display: 'inline',
    textAlign: 'left',
  },
  stepExplainerHeader: {
    fontSize: 24,
    color: '#6850A8',
    fontWeight: 'bold',
    display: 'inline',
  },
  stepExplainer: { display: 'inline' },
  muggleToggle: {
    position: 'absolute',
    right: '2rem',
  },
}));

const HowItWorks = () => {
  const muggleHowItWorks = [
    {
      header: 'Join the fund',
      explainer:
        'Deposit DAI, a crypto stable coin, into the fund to be part of the decentralized autonomous organization. The more DAI you deposit into the fund the more voting power you receive.',
    },
    {
      header: 'The funds in the pool earn interest',
      explainer:
        'The funds are deposited into a savings account with Aave. Interest accrues on the DAI in the fund.',
    },
    {
      header: 'Vote',
      explainer:
        'Every user who has deposited funds into the pool can vote on the proposal they feel is most worthy of receiving the interest. You can vote using your crypto wallet or you can vote on twitter by replying to the fortnightly tweet by @dao_care',
    },
    {
      header: 'Winner',
      explainer:
        'At the end of each two week round the proposal with the most votes receives the interest from the fund generated over those 2 weeks. A new round begins every two weeks. ',
    },
    {
      header: 'Withdraw all your funds',
      explainer:
        'At any point if you want to leave. You can withdraw all of your DAI from the fund',
    },
  ];

  const wizardHowItWorks = [
    {
      header: 'Join the fund',
      explainer:
        'Deposit DAI into the fund to be part of the DAO. The more you deposit the more voting power you receive.',
    },
    {
      header: 'The fund earns interest',
      explainer: 'Interest accrues on the DAI in the fund.',
    },
    {
      header: 'Vote',
      explainer:
        'Vote on the proposal you feel is most worthy of receiving the interest',
    },
    {
      header: 'Winner',
      explainer:
        'At the end of each two week round the proposal with the most votes receives the interest from the fund.',
    },
    {
      header: 'Withdraw all your funds',
      explainer:
        'At any point if you want to leave. You can withdraw all of your DAI from the fund',
    },
  ];

  const classes = useStyles();
  const [howSteps, setHowSteps] = useState(wizardHowItWorks);

  const [isMuggle, setIsMuggle] = React.useState(true);

  const handleChange = (event) => {
    setHowSteps(event.target.checked ? wizardHowItWorks : muggleHowItWorks);
    setIsMuggle(event.target.checked);
  };

  return (
    <Page title="dao.care | How it works">
      <Header />
      <div className={classes.muggleToggle}>
        <FormControlLabel
          control={
            <Switch
              checked={isMuggle}
              onChange={handleChange}
              name="isMuggle"
              color="primary"
            />
          }
          labelPlacement="start"
          label={
            isMuggle
              ? "I'm a blockchain wizard 🧙🏽‍♂️"
              : "I'm a blockchain muggle 🧘🏾‍♀️"
          }
        />
      </div>
      {/* <Typography variant="h5">How it Works</Typography> */}
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.gridContainer}
      >
        {howSteps.map((step, index) => (
          <Grid item xs={12} md={12} className={classes.gridItem}>
            <span style={{ width: '20px' }}>
              <Typography variant="body1" className={classes.numberHighlight}>
                {index + 1}.{' '}
              </Typography>
            </span>
            {/* </Grid> */}
            <Typography className={classes.stepExplainerHeader}>
              {step.header}
            </Typography>
            <br />
            <span style={{ width: '20px' }} />
            <Typography variant="body1" className={classes.stepExplainer}>
              {step.explainer}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
};

export default HowItWorks;
