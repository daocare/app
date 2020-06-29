import Box from '3box';
import { BOX_SPACE } from './Documents3BoxSpace';

let box = null;
let space = null;
let fetching = false;

export const open3Box = async (address, provider, setStatus = console.log) => {
  if (box && space) {
    return { box, space };
  }
  if (fetching) {
    throw new Error('trying to open 3Box while fetching...');
  }
  fetching = true;
  try {
    if (typeof provider !== 'undefined') {
      setStatus('Approve access to 3Box on your wallet');

      console.log('box await');
      console.log(address);
      console.log('box await');
      console.log(provider);

      box = await Box.openBox(address, provider, {
        consentCallback: () => {
          setStatus('Synchronizing with 3Box');
        },
      });
      console.log('box await complete');

      setStatus('Finalizing synchronization with 3Box');
      await box.syncDone;
      setStatus('Approve opening dao.care space on your wallet');
      space = await box.openSpace(BOX_SPACE, {
        consentCallback: () => {
          setStatus('Synchronizing with your 3Box space');
        },
      });
      setStatus('Finalizing synchronization with your 3Box space');
      await space.syncDone;
      setStatus('3Box space opened');
      return { box, space };
    } else {
      throw new Error('No web3 provider available');
    }
  } catch (error) {
    fetching = false;
    throw error;
  } finally {
    fetching = false;
  }
};

export const get3BoxProfile = async (address) => {
  try {
    const profile = await Box.getProfile(address);
    const verifiedAccounts = await Box.getVerifiedAccounts(profile);

    return {
      profile:
        Object.entries(profile).length === 0 && profile.constructor === Object
          ? null
          : profile,
      verifiedAccounts:
        Object.entries(verifiedAccounts).length === 0 &&
        verifiedAccounts.constructor === Object
          ? null
          : verifiedAccounts,
    };
  } catch {
    return {
      profile: null,
      verifiedAccounts: null,
    };
    console.warn("Couldn't find user in 3box");
  }
};

export const logout3Box = async () => {
  if (box) {
    await box.logout();
  }
  box = null;
  space = null;
};

export const isLoggedIn = async (address) => {
  if (address) {
    return Box.isLoggedIn(address);
  }
  return false;
};

export const getBox = () => box;
export const getSpace = () => space;
export const isFetching = () => fetching;

export const getProposalFromThreadHash = async (threadAddress) => {
  let posts = await Box.getThreadByAddress(threadAddress);
  if (posts && posts.length > 0) {
    return posts[0]['message'];
  }
  return null;
};

//TODO delete
export const getProposalFromThreadHashOld = async (threadAddress) => {
  let posts = await Box.getThreadByAddress(threadAddress);
  if (posts && posts.length > 0) {
    return posts[0];
  }
  return null;
};
