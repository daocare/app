import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
// import MomentUtils from "@date-io/moment";
import { Provider as StoreProvider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import { renderRoutes } from 'react-router-config';
import './App.css';

import theme from './theme';
import { configureStore } from './store';
import routes from './routes';
import { ScrollReset } from './components';
// import './mixins/chartjs';
// import './mixins/moment';
// import './mixins/validate';
// import './mixins/prismjs';
// import './mock';
// import './assets/scss/index.scss';
// import { analytics } from "./modules/firebase";

const history = createBrowserHistory();
const store = configureStore();

const App = () => {
  // useEffect(() => {
  //   // if (!firebase.apps.length) {

  //   // }
  // }, []);
  // return (
  //   <div>
  //     <Router history={history}>{renderRoutes(routes)}</Router>
  //   </div>
  // );

  return (
    <StoreProvider store={store}>
      <ThemeProvider theme={theme}>
        {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
        <Router history={history}>
          <ScrollReset />
          {renderRoutes(routes)}
        </Router>
        {/* </MuiPickersUtilsProvider> */}
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
