/* eslint-disable no-undef */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import useRouter from '../../utils/useRouter';

// import useRouter from 'utils/useRouter';
const Header = props => {
  const router = useRouter();
  return (
    <React.Fragment>
      <div style={{ margin: '30px 0px 16px 0px' }}>
        <img
          src="/assets/logo.svg"
          style={{ height: '90px', display: 'inline' }}
        />
        <Typography
          gutterBottom
          variant="h1"
          style={{
            marginTop: '76px',
            cursor: 'pointer',
            fontFamily: 'nunito',
            fontWeight: 700,
            display: 'inline',
          }}
          onClick={() => {
            router.history.push('/');
          }}
        >
          dao.care
        </Typography>

        <Typography variant="body1" style={{ marginTop: 16 }}>
          Deposit your DAI. Let your idle interest support community projects.
          Vote DAO style on twitter for your favourite project every 2 weeks.
          Interest from the pool is sent to the chosen community project for 2
          weeks if selected by the DAO. Withdraw your original DAI at anytime.
        </Typography>
      </div>
    </React.Fragment>
  );
};

export default Header;
