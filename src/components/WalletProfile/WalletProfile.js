/* eslint-disable no-undef */
import React from 'react';
import useWeb3Connect from '../../utils/useWeb3Connect';
import Button from '@material-ui/core/Button';
import ProfileHover from 'profile-hover';
import Container from '@material-ui/core/Container';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import purple from '@material-ui/core/colors/purple';
import useRouter from '../../utils/useRouter';

// import useRouter from 'utils/useRouter';
const WalletProfile = props => {
  const web3Connect = useWeb3Connect();
  const router = useRouter();

  const handleConnect = () => {
    web3Connect.triggerConnect();
  };
  const handleLogout = async () => {
    // await logout3Box();
    await web3Connect.resetApp();
    router.history.push('/');

    // setThreeBoxStatus(null);
    // setThreeBoxConnectionStep(0);
    // setSaveType("3BO X_SCREEN");
  };
  if (web3Connect.connected && web3Connect.address) {
    // console.log(web3Connect);
    // console.log({ address: web3Connect.address });
    return (
      <Container maxWidth="md">
        {/* <div>Connected: {web3Connect.address}</div>
        <div>Network: {web3Connect.network}</div> */}
        <div
          style={{
            float: 'right',
            marginTop: 16,
            marginBottom: 16,
            color: 'white !important',
          }}
        >
          <ProfileHover
            address={web3Connect.address}
            showName={true}
            noTheme={true}
            // orientation="bottom"
            displayFull={true}
          />
          {/* <Link
            component="button"
            variant="body2"
            onClick={handleLogout}
            style={{
              display: 'block',
              margin: 'auto',
            }}
          >
            Logout
          </Link> */}
          <Tooltip title="Disconnect from wallet">
            <IconButton
              style={{ color: purple[50] }}
              aria-label="add an alarm"
              onClick={handleLogout}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Container>
    );
  }
  return (
    <Container maxWidth="md">
      {/* <div>Connected: {web3Connect.address}</div>
        <div>Network: {web3Connect.network}</div> */}
      <div style={{ float: 'right', marginTop: 16, marginBottom: 16 }}>
        <Button
          variant="contained"
          color="secondary"
          disableElevation
          onClick={handleConnect}
        >
          Connect
        </Button>
      </div>
    </Container>
  );
};

export default WalletProfile;
