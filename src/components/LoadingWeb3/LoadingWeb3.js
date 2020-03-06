import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import TwitterIcon from '@material-ui/icons/Twitter';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InsertLinkIcon from '@material-ui/icons/InsertLink';

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
      <img
        src="/waiting-web3.svg"
        style={{ maxWidth: '100%', maxHeight: 280 }}
        alt="Waiting for web3"
      />
      <Typography
        variant="body1"
        style={{
          marginTop: 16,
          textAlign: 'center',
          color: '#A362A5',
          fontWeight: 400,
        }}
      >
        Waiting for an action on your wallet...
      </Typography>
    </div>
  );
}
