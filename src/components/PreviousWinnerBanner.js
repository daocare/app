import React from 'react';

const PreviousWinnerBanner = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: '1rem',
      color: 'white',
      backgroundColor: '#6850A8',
      padding: '0.4rem 2rem',
      fontFamily: 'nunito',
      fontWeight: 700,
      transform: 'rotate(-45deg) translate(-47px, -13px)',
    }}
  >
    <span>PREVIOUS WINNER</span>
  </div>
);

export default PreviousWinnerBanner;
