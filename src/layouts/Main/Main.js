import React, { Suspense } from 'react';
import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress } from '@material-ui/core';

import { TopBar } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    zIndex: 2,
    position: 'relative',
  },
  container: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    overflowY: 'auto',
    flex: '1 1 auto',
    position: 'absolute',
    top: 0,
    // [theme.breakpoints.up('sm')]: {
    //   top: 64,
    // },
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: theme.palette.background.default,
    background: 'red', //#0f0c29' /* fallback for old browsers */,
    background:
      '-webkit-linear-gradient(to right, #24243e, #302b63, #0f0c29)' /* Chrome 10-25, Safari 5.1-6 */,
    background:
      'linear-gradient(to right, #24243e, #302b63, #0f0c29)' /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,
  },
}));

const Dashboard = props => {
  const { route } = props;

  const classes = useStyles();
  // const [openNavBarMobile, setOpenNavBarMobile] = useState(false);

  // const handleNavBarMobileOpen = () => {
  //   setOpenNavBarMobile(true);
  // };

  // const handleNavBarMobileClose = () => {
  //   setOpenNavBarMobile(false);
  // };

  return (
    <div className={classes.root}>
      {/* <TopBar
        className={classes.topBar}
        // onOpenNavBarMobile={handleNavBarMobileOpen}
      /> */}
      <div className={classes.container}>
        <main className={classes.content}>
          <Suspense fallback={<LinearProgress />}>
            {renderRoutes(route.routes)}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  route: PropTypes.object,
};

export default Dashboard;
