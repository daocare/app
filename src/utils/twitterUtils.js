import { FIREBASE_FUNCTIONS_ENDPOINT } from '../config/firebase';

export const linkTwitterHandleToEthAddressInFirebase = async (
  handle,
  address,
  txHash
) => {
  const response = await fetch(
    FIREBASE_FUNCTIONS_ENDPOINT + '/registerTwitterHandle',
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        handle,
        address,
        txHash,
      }), // body data type must match "Content-Type" header
    }
  );
  return await response.json();
};

export const voteTwitter = (emoji) => {
  let url =
    'https://twitter.com/intent/tweet?text=' +
    encodeURI(`I am voting for proposal ~${emoji} on `) +
    '%23' +
    encodeURI(`DAOcare - A no loss funding DAO @dao_care`);
  var win = window.open(url, '_blank');
  win.focus();
};
