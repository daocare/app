import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: 370,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default function LoadingWeb3(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography
        variant="body1"
        style={{
          margin: 16,
          textAlign: 'center',
          color: '#A362A5',
          fontWeight: 400,
        }}
      >
        Waiting for your wallet...
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
  );
}
