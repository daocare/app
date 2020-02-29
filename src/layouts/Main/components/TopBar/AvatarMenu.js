import React from 'react';
import PropTypes from 'prop-types';
// import { makeStyles } from '@material-ui/styles';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import useRouter from '../../../../utils/useRouter';

// import { useAuthState } from 'react-firebase-hooks/auth';

// const useStyles = makeStyles(theme => ({
//   root: {
//   },

// }));

const AvatarMenu = props => {
  const { anchorEl, setAnchorEl } = props;
  // const [userLoggedIn, setUserLoggedIn] = useState(isUserLoggedIn());
  // const [user, loading, error] = useAuthState(auth);

  // const router = useRouter();

  const handleClose = () => {
    setAnchorEl(null);
  };
  // console.log(user);
  // const classes = useStyles();
  return (
    <Menu
      id="simple-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={handleClose}>Profile</MenuItem>
      {/* <MenuItem onClick={() => router.history.push('/management/my-routes')}>
        My Routes
      </MenuItem>
      <MenuItem onClick={() => auth.signOut()}>Logout</MenuItem> */}
    </Menu>
  );
};

AvatarMenu.propTypes = {
  className: PropTypes.string,
  anchorEl: PropTypes.any,
  // onOpenNavBarMobile: PropTypes.func
};

export default AvatarMenu;
