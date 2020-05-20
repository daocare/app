const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const NETWORK_NAME = process.env.REACT_APP_SUPPORTED_CHAIN_NAME;
const INFURA_ENDPOINT = `https://${NETWORK_NAME}.infura.io/v3/${INFURA_KEY}`;

export default INFURA_ENDPOINT;
