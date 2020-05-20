/* eslint-disable no-undef */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProvider } from '../redux/web3/web3Actions';

import useWeb3Modal from '../utils/useWeb3Modal';
import useRouter from '../utils/useRouter';
import INFURA_ENDPOINT from '../utils/infura';

import Button from '@material-ui/core/Button';
import ProfileHover from 'profile-hover';
import Container from '@material-ui/core/Container';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import purple from '@material-ui/core/colors/purple';

const WalletProfile = (props) => {
  const web3Modal = useWeb3Modal();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleConnect = () => {
    try {
      web3Modal.triggerConnect().then((provider) => {
        dispatch(setProvider(provider));
      });
    } catch (err) {
      console.warn('Failed to connect');
      console.warn(err);
    }
  };
  const handleLogout = async () => {
    web3Modal.triggerDisconnect().then(() => {
      dispatch(setProvider(INFURA_ENDPOINT));
    });
    router.history.push('/');
  };

  const { connected, address } = useSelector((state) => state.user);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '10vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          color: 'white !important',
        }}
      >
        {connected ? (
          <>
            <ProfileHover
              address={address}
              showName={true}
              noTheme={true}
              displayFull={true}
            />
            <Tooltip title="Disconnect wallet">
              <IconButton style={{ color: purple[50] }} onClick={handleLogout}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            disableElevation
            onClick={handleConnect}
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default WalletProfile;
