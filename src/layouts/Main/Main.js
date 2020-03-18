import React, { Suspense } from 'react';
import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import BetaFlag from '../../components/BetaFlag/BetaFlag';
import { Page, WalletProfile } from '../../components';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  pageContainer: {
    // backgroundColor: '#fafafa',
    // backgroundImage: 'url("/images/undraw_deliveries_131a.svg")',
    // backgroundRepeat: 'no-repeat',
    margin: theme.spacing(10, 2, 2, 2),
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(10),
    },

    // backgroundSize: '45%',
    // backgroundPosition: '98% 5px',
    position: 'relative',

    padding: theme.spacing(2),
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
    background:
      '-webkit-radial-gradient(#B1A4D4 5%, #9E8DC9 30%, #6850A8 60%);' /* Chrome 10-25, Safari 5.1-6 */,
    // eslint-disable-next-line
    background:
      'radial-gradient(#B1A4D4 10%, #9E8DC9 30%, #6850A8 90%);' /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,
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

  // const classes = {};
  return (
    <div className={classes.root}>
      {/* <TopBar
        className={classes.topBar}
        // onOpenNavBarMobile={handleNavBarMobileOpen}
      /> */}
      <div className={classes.container}>
        <main className={classes.content}>
          <BetaFlag />
          <WalletProfile />
          <Container maxWidth="md">
            <Paper elevation={0}>
              <Suspense fallback={<LinearProgress />}>
                <Page className={classes.pageContainer} title="dao.care">
                  {renderRoutes(route.routes)}
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={{ textAlign: 'center' }}
                  >
                    We are currently running on Kovan network. Please get DAI
                    from Aave{' '}
                    <a
                      href="https://testnet.aave.com/faucet/DAI"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      test app
                    </a>
                    .
                  </Typography>
                </Page>
              </Suspense>
            </Paper>
          </Container>
        </main>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  route: PropTypes.object,
};

export default Dashboard;
