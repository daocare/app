import moment from 'moment';

const keccak256 = require('keccak256');

const chainId = process.env.REACT_APP_SUPPORTED_CHAIN_ID;
const networkSuffix = chainId == 42 ? '-kovan' : '';

export const BOX_SPACE = 'daocare' + networkSuffix;

const convertFilename2Hash = (fileName) => {
  return keccak256(fileName).toString('hex');
};

export const getDocumentInfo = async (space, fileName) => {
  let key = convertFilename2Hash(fileName);
  let metadata = await space.private.getMetadata(key);
  let document = await space.private.get(key);
  let log = await space.private.log();
  let versions = log.filter((entry) => entry.key === key);
  return { document, metadata, versions };
};

export const saveDocument = async (space, fileName, document, screenshot) => {
  let key = convertFilename2Hash(fileName);
  let documentStruct = {
    fileName,
    data: document,
    screenshot,
  };

  await space.private.set(key, documentStruct);
};

export const loadDocuments = async (space) => {
  let files = await space.private.all({ metadata: true });
  let documents = Object.values(files).map((file) => ({
    timestamp: file.timestamp,
    timestampStr: moment.unix(file.timestamp).fromNow(),
    ...file.value,
  }));
  documents.sort((fileA, fileB) => fileB.timestamp - fileA.timestamp);
  return documents;
};
