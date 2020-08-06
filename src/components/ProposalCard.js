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
import { voteTwitter } from '../utils/twitterUtils';

import PreviousWinnerBanner from './PreviousWinnerBanner';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: 210,
    height: '100%',
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
  return (
    <Card className={classes.root} {...rest}>
      <CardActionArea
        onClick={() => {
          router.history.push(`/proposals/${id}`);
        }}
      >
        {isPreviousWinner && <PreviousWinnerBanner />}
        {imageUrl && (
          <CardMedia className={classes.media} image={imageUrl} title={title} />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            <small>{title}</small>
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
          <IconButton
            aria-label="open"
            href={website}
            target="_blank"
            rel="noopener noreferrer"
          >
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
              onClick={() => voteTwitter(emoji)}
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
