/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import useWeb3Modal from '../utils/useWeb3Modal';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import useRouter from '../utils/useRouter';

const useStyles = makeStyles((theme) => ({
  navContainer: {
    height: '10vh',
    width: '100%',
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLink: {
    margin: '0 10px',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      opacity: '0.6',
    },
  },
  socials: {
    height: '20px',
    marginLeft: '5px',
    '&:hover': {
      opacity: '0.6',
    },
  },
}));

const Nav = (props) => {
  const classes = useStyles();
  const router = useRouter();
  const web3Modal = useWeb3Modal();
  const connected = useSelector((state) => state.user.connected);
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
            if (connected) {
              router.history.push('/deposit');
            } else {
              const connect = async () => {
                try {
                  await web3Modal.triggerConnect();
                  router.history.push('/deposit');
                } catch {
                  console.warn('Cancelled connection');
                }
              };
              connect();
            }
          }}
        >
          Deposit
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            if (connected) {
              router.history.push('/withdraw');
            } else {
              const connect = async () => {
                try {
                  await web3Modal.triggerConnect();
                  router.history.push('/withdraw');
                } catch {
                  console.warn('Cancelled connection');
                }
              };
              connect();
            }
          }}
        >
          Withdraw
        </Typography>
        <Typography
          gutterBottom
          variant="body1"
          className={classes.navLink}
          onClick={() => {
            if (connected) {
              router.history.push('/submit-proposal');
            } else {
              const connect = async () => {
                try {
                  await web3Modal.triggerConnect();
                  router.history.push('/submit-proposal');
                } catch {
                  console.warn('Cancelled connection');
                }
              };
              connect();
            }
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
        <div className={classes.socialsContainer}>
          <a href="https://twitter.com/dao_care" target="_blank">
            <img
              src="/assets/socials/twitter.svg"
              className={classes.socials}
            />
          </a>
          <a href="https://t.me/daocare" target="_blank">
            <img
              src="/assets/socials/telegram.svg"
              className={classes.socials}
            />
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

Nav.propTypes = {
  className: PropTypes.string,
};

export default Nav;
