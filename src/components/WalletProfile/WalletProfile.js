/* eslint-disable no-undef */
import React from 'react';
import useWeb3Connect from '../../utils/useWeb3Connect';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import ProfileHover from 'profile-hover';
import Container from '@material-ui/core/Container';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import useRouter from '../../utils/useRouter';

// import useRouter from 'utils/useRouter';
const WalletProfile = props => {
  const { title, children, ...rest } = props;
  const web3Connect = useWeb3Connect();
  const router = useRouter();

  // const handleConnect = () => {
  //   web3Connect.triggerConnect();
  // };
  const handleLogout = async () => {
    // await logout3Box();
    await web3Connect.resetApp();
    router.history.push('/');

    // setThreeBoxStatus(null);
    // setThreeBoxConnectionStep(0);
    // setSaveType("3BO X_SCREEN");
  };
  if (web3Connect.connected && web3Connect.address) {
    console.log(web3Connect);
    console.log({ address: web3Connect.address });
    return (
      <Container maxWidth="md">
        {/* <div>Connected: {web3Connect.address}</div>
        <div>Network: {web3Connect.network}</div> */}
        <div style={{ float: 'right', marginTop: 16, marginBottom: 16 }}>
          <ProfileHover
            address={web3Connect.address}
            showName={true}
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
              // color="secondary"
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
  return null;
  // return (
  //   <React.Fragment>
  //     <div>
  //       <Button
  //         variant="contained"
  //         color="primary"
  //         disableElevation
  //         onClick={handleConnect}
  //       >
  //         Connect with wallet
  //       </Button>
  //     </div>
  //   </React.Fragment>
  // );
};

export default WalletProfile;
