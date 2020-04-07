import React from 'react';

const BetaFlag = props => {
  return (
    <div className="betaFlag">
      <p
        style={{
          color: 'white',
          margin: '0.4rem',
          fontFamily: 'nunito',
          fontWeight: 700,
          transform: 'rotate(-45deg)',
        }}
      >
        BETA
      </p>
    </div>
  );
};

export default BetaFlag;
