import { useDispatch, useSelector } from 'react-redux';

import { set3BoxData } from '../redux/user/userActions';

import {
  open3Box,
  get3BoxProfile,
  isFetching,
  // logout3Box,
  isLoggedIn,
  // getProposalFromThreadHashOld,
} from './3BoxManager';

const use3Box = () => {
  const dispatch = useDispatch();
  const address = useSelector((state) => state.user.address); //TODO await?
  const provider = useSelector((state) => state.web3.provider);

  const update3BoxDetails = async () => {
    try {
      if (address) {
        const loggedIn = await isLoggedIn(address);
        let { profile, verifiedAccounts } = await get3BoxProfile(address);

        // check if user has this space, if so we can open the box in the bg
        if (loggedIn && !isFetching) {
          await open3Box(address, provider);
        }

        await dispatch(set3BoxData(loggedIn, profile, verifiedAccounts));
      }
    } catch (err) {
      console.warn('Unable to update 3box details', err);
    }
  };
  return { update3BoxDetails };
};

export default use3Box;
