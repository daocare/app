import React, { useState, useRef } from 'react';
import { Buffer } from 'buffer';
import { ToastMessage, Progress } from 'rimble-ui';
import { Heading, Text } from 'rimble-ui';
import { add, pin } from '../lib/ipfs';

const UploadProgress = ({
  image,
  uploadProgress: { progress, done, pinned },
}) => {
  const progPercent = (progress / image.ipfsDagSize) * 100;
  return (
    <div>
      {done ? (
        pinned ? (
          <React.Fragment>
            <h1>Image is pinned to IPFS</h1>
            <p>
              When the Ethereum transaction goes through your image should
              appear in its spot.
            </p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h1>Uploaded</h1>
            <p>
              The data is on IPFS, but we are currently 'pinning' the data to
              make it last forever.
            </p>
            <p>
              In the meantime you can add the IPFS hash to the smart contract.
            </p>
          </React.Fragment>
        )
      ) : (
        <div>
          {progPercent <
          98 /*98 is a random number it must jus be quite high so this condition only triggers when waiting for ipfs at the end */ ? (
            <div>
              <ToastMessage.Processing my={0} message={'Sending to IPFS'} />
            </div>
          ) : (
            <div>
              <ToastMessage.Processing
                my={0}
                message={'Verifying upload on IPFS'}
              />
              <p>
                Please be patient, decentralisation is still a bit slow
                unfortunately.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UploadImage = ({ updateImageHashOnSmartContract }) => {
  const [currentImage, setCurrentImage] = useState({
    data: null,
    name: null,
    size: 0,
    ipfsDagSize: 0,
  });
  const progressRef = useRef({ progress: 0, done: false });

  const handleChangeImage = evt => {
    var reader = new FileReader();
    var file = evt.target.files[0];
    const size = file.size;
    const name = file.name;
    const ipfsApproxDagSize = size * 1.335; // NOTE: This is a rough, and slight over estimate, will need to be calculated to be precise.

    reader.onload = async upload => {
      const data = upload.target.result;
      setCurrentImage({ data, size, ipfsDagSize: ipfsApproxDagSize });
      // Set the progress to 100% for now since the code for the progress updates isn't working nicely.
      //    See the 'NOTE' a few lines down. - When that is added, this line can be removed
      progressRef.current = { progress: ipfsApproxDagSize, done: false };

      // NOTE: this code gets the hash of the data without any network activity
      // const multihashing = require('multihashing-async')
      // const digest = await multihashing.digest(buf, 'sha1')
      // const dataHash = await new Promise(
      //   (resolve, reject) => multihashing(
      //     Buffer.from(data),
      //     'sha1',
      //     (err, result) =>
      //       resolve(
      //         result.toString('hex')
      //       )
      //   )
      // )
      // NOTE: this method isn't supported by infura, but it would be useful to see if the file already exists on IPFS
      // const getNumberOfProviders = await window.ipfsNode.dht.findProvs(dataHash, { timeout: 1000, maxNumProviders: 2 })

      // console.log(data)
      const result = await add(Buffer.from(data), name, '?pin=false');
      // const result = await window.ipfsNode.add(
      //   Buffer.from(data),
      //   {
      //     // // NOTE: this was removed because it was giving problems with infura (it would hang)
      //     // progress: progress =>
      //     //   progressRef.current = { progress, done: false },
      //     pin: false, // Note: if all were good in the world this would be true, problem is that this is extremely slow and not user friendly!
      //   },
      // )
      const ipfsHash = result.Hash;
      progressRef.current = {
        progress: ipfsApproxDagSize,
        done: true,
        ipfsHash,
        pinned: false,
      };
      updateImageHashOnSmartContract(ipfsHash);
      // Try to pin the hash in the background!
      const pinResult = await pin(ipfsHash);
      progressRef.current = {
        progress: ipfsApproxDagSize,
        done: true,
        ipfsHash,
        pinned: true,
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Heading.h3>Upload Image</Heading.h3>

      {!!currentImage.data ? (
        <UploadProgress
          image={currentImage}
          uploadProgress={progressRef.current}
        ></UploadProgress>
      ) : (
        <React.Fragment>
          <Text>
            We recommend an optimal image dimesions of 300 x 300 pixels
          </Text>
          <input
            type="file"
            name="file"
            className="upload-file"
            id="file"
            onChange={handleChangeImage}
            encType="multipart/form-data"
            required
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default UploadImage;
