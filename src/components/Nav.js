/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import useRouter from '../utils/useRouter';

const useStyles = makeStyles((theme) => ({
  navContainer: {
    width: '100%',
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
  },
  navLink: {
    margin: '0 10px',
    color: 'white',
    cursor: 'pointer',
  },
}));

const Nav = (props) => {
  const classes = useStyles();
  const router = useRouter();
  return (
    <React.Fragment>
      <div className={classes.navContainer}>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/');
          }}
        >
          Home
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/proposals');
          }}
        >
          Proposals
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/deposit');
          }}
        >
          Deposit
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/withdraw');
          }}
        >
          Withdraw
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/submit-proposal');
          }}
        >
          Submit
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            router.history.push('/how-it-works');
          }}
        >
          How it Works
        </Typography>
      </div>
    </React.Fragment>
  );
};

Nav.propTypes = {
  className: PropTypes.string,
};

export default Nav;
