/* eslint-disable no-undef */
import React from 'react';
import useWeb3Connect from '../utils/useWeb3Connect';
import useRouter from '../utils/useRouter';
import Button from '@material-ui/core/Button';
import ProfileHover from 'profile-hover';
import Container from '@material-ui/core/Container';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import purple from '@material-ui/core/colors/purple';

const WalletProfile = (props) => {
  const web3Connect = useWeb3Connect();
  const router = useRouter();

  const handleConnect = () => {
    web3Connect.triggerConnect();
  };
  const handleLogout = async () => {
    await web3Connect.resetApp();
    router.history.push('/');
  };
  if (web3Connect.connected && web3Connect.address) {
    return (
      <Container maxWidth="md">
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
            displayFull={true}
          />
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
