import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { AppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import TwitterIcon from "@material-ui/icons/Twitter";

import Avatar from "@material-ui/core/Avatar";
import AvatarMenu from "./AvatarMenu";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#FFFFFF"
  },
  logo: {
    width: 120,
    marginTop: theme.spacing(0.5)
  },
  socialContainer: {
    float: "right",
    display: "flex"
  },
  socialContainerLoggedIn: {
    marginTop: theme.spacing(1)
  },
  avatar: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    width: 24,
    height: 24,
    fontSize: "0.7rem",
    marginTop: theme.spacing(0.5),
    cursor: "pointer"
    // marginLeft: theme.spacing(1.5)
  }
}));

const TopBar = props => {
  const { className, ...rest } = props;
  const [anchorMenuEl, setAnchorMenuEl] = React.useState(null);

  const handleAvatarClick = event => {
    setAnchorMenuEl(event.currentTarget);
  };

  // console.log(user);
  const classes = useStyles();
  return (
    <AppBar {...rest} className={clsx(classes.root, className)} elevation={6}>
      <Toolbar>
        <Container maxWidth="md">
          <RouterLink to="/">
            {/* <img
              alt="padely"
              src="/images/logos/padely_logo_horizontal_dark.svg"
              className={classes.logo}
            /> */}
            <Typography variant="button">ETHLondon</Typography>
          </RouterLink>
          <div className={classes.socialContainer}>
            {/* <LanguagePicker />
            {!userLoggedIn && (
              <React.Fragment>
                <IconButton
                  aria-label="linkedin"
                  target="_blank"
                  href="https://www.linkedin.com/company/padely-home"
                  color="primary"
                >
                  <LinkedInIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  aria-label="twitter"
                  target="_blank"
                  href="https://twitter.com/_padely"
                  color="primary"
                >
                  <TwitterIcon fontSize="inherit" />
                </IconButton>
              </React.Fragment>
            )}
            {userLoggedIn && (
              // <Button variant="text" onClick={() => auth.signOut()}>
              //   Logout
              // </Button>
              <React.Fragment>
                <Avatar className={classes.avatar} onClick={handleAvatarClick}>{userLetter}</Avatar>
              <AvatarMenu anchorEl={anchorMenuEl} setAnchorEl={setAnchorMenuEl} />
              </React.Fragment>
            )}*/}
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string
  // onOpenNavBarMobile: PropTypes.func
};

export default TopBar;
