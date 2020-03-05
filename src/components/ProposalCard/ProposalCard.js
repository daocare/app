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
    width: 210,
    height: 370,
    marginRight: 16,
  },
  media: {
    height: 140,
  },
});

export default function ProposalCard(props) {
  const { title, description, website, image, id } = props.proposal;
  const { votingAllowed, twitterAllowed, vote, address } = props;
  const classes = useStyles();
  console.log({ vote });
  const voteTwitter = () => {
    let url =
      'https://twitter.com/intent/tweet?text=' +
      encodeURI(`I am voting for proposal ~${id} on `) +
      '%23' +
      encodeURI(`DAOcare - A no loss funding DAO @dao_care`);
    console.log(url);
    var win = window.open(url, '_blank');
    win.focus();
  };
  return (
    <Card className={classes.root}>
      <CardActionArea>
        {image && (
          <CardMedia className={classes.media} image={image} title={title} />
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
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ float: 'right' }}>
        <Tooltip title="Open website">
          <IconButton aria-label="open" href={website} target="_blank">
            <InsertLinkIcon />
          </IconButton>
        </Tooltip>
        {votingAllowed && (
          <Tooltip title="Vote using your wallet">
            <IconButton
              color="primary"
              aria-label="vote"
              onClick={() => vote(id)}
            >
              <HowToVoteIcon />
            </IconButton>
          </Tooltip>
        )}
        {twitterAllowed && (
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
}
