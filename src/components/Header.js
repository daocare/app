/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import useRouter from '../utils/useRouter';

const useStyles = makeStyles((theme) => ({
  headerContainer: {
    cursor: 'pointer',
    [theme.breakpoints.up('sm')]: {
      margin: '0px 0px 0px 0px',
    },
  },
  headerLogo: {
    height: '70px',
    display: 'inline',
    textAlign: 'left',
    [theme.breakpoints.down('xs')]: {
      height: '40px',
    },
  },
  headerText: {
    fontFamily: 'nunito',
    fontWeight: 700,
    display: 'inline',
    fontSize: '70px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '42px',
    },
  },
}));

const Header = (props) => {
  const classes = useStyles();
  const router = useRouter();
  return (
    <React.Fragment>
      <div
        className={classes.headerContainer}
        onClick={() => {
          router.history.push('/');
        }}
      >
        <img
          src="/assets/logo.svg"
          className={classes.headerLogo}
          alt="dao.care logo"
        />
        <Typography gutterBottom variant="h1" className={classes.headerText}>
          dao.care
        </Typography>
      </div>
    </React.Fragment>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
