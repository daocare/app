import React from 'react';

const PreviousWinnerBanner = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: '1rem',
      color: 'white',
      backgroundColor: '#6850A8',
      padding: '0.1rem 2rem',
      fontFamily: 'nunito',
      fontWeight: 700,
      transform: 'rotate(-45deg) translate(-34px, -20px)',
    }}
  >
    <p>PREVIOUS WINNER</p>
  </div>
);

export default PreviousWinnerBanner;
