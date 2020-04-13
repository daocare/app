import React from 'react';
import useRouter from '../utils/useRouter';

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

import { getUrlByHash } from '../modules/pinata';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: 210,
    height: 370,
    marginRight: 16,
  },
  media: {
    height: 140,
  },
});

const ProposalCard = (props) => {
  const router = useRouter();
  const { title, shortDescription, website, image, id, emoji } = props.proposal;
  let imageUrl = getUrlByHash(image);
  const {
    isPreviousWinner,
    votingAllowed,
    twitterAllowed,
    vote,
    ...rest
  } = props;
  const classes = useStyles();
  const voteTwitter = () => {
    let url =
      'https://twitter.com/intent/tweet?text=' +
      encodeURI(`I am voting for proposal ~${emoji} on `) +
      '%23' +
      encodeURI(`DAOcare - A no loss funding DAO @dao_care`);
    var win = window.open(url, '_blank');
    win.focus();
  };
  return (
    <Card className={classes.root} {...rest}>
      <CardActionArea
        onClick={() => {
          router.history.push(`/proposals/${id}`);
        }}
      >
        {isPreviousWinner && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '1rem',
              color: 'white',
              backgroundColor: '#6850A8',
              padding: '0.1rem 2rem',
              fontFamily: 'nunito',
              fontWeight: 700,
              transform: 'rotate(-45deg) translate(-34px, -20px)',
            }}
          >
            <p>PREVIOUS WINNER</p>
          </div>
        )}
        {imageUrl && (
          <CardMedia className={classes.media} image={imageUrl} title={title} />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{ maxHeight: 60 }}
          >
            {shortDescription}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ float: 'right' }}>
        <Tooltip title="Open website">
          <IconButton aria-label="open" href={website} target="_blank">
            <InsertLinkIcon />
          </IconButton>
        </Tooltip>
        {votingAllowed && !isPreviousWinner && (
          <Tooltip title="Vote using your wallet">
            <IconButton
              color="primary"
              aria-label="vote"
              onClick={() => vote(id)} //TODO : Possible bug - need to look if its (id - 1)
            >
              <HowToVoteIcon />
            </IconButton>
          </Tooltip>
        )}
        {twitterAllowed && !isPreviousWinner && (
          <Tooltip title="Vote via Twitter">
            <IconButton
              color="secondary"
              aria-label="vote via twitter"
              onClick={voteTwitter}
            >
              <TwitterIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default ProposalCard;
