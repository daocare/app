import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Header from './Header';
import EllipsisLoader from './EllipsisLoader';
const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    marginTop: 16,
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const LoadingWeb3 = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.loadingContainer}>
        <Typography
          variant="body1"
          style={{
            margin: 16,
            textAlign: 'center',
            color: '#A362A5',
            fontWeight: 400,
          }}
        >
          Web3 Loading
          <EllipsisLoader />
        </Typography>
        <img
          src="/waiting-web3.svg"
          style={{ maxWidth: '100%', maxHeight: 280 }}
          alt="Waiting for web3"
        />
        <LinearProgress
          color="secondary"
          style={{ maxWidth: '80%', margin: 'auto', marginTop: 32 }}
        />
      </div>
    </div>
  );
};

export default LoadingWeb3;
