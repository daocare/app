/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import { lazy } from 'react';
// import { Redirect } from 'react-router-dom';

import MainLayout from './layouts/Main';

const routes = [
  {
    path: '/',
    component: MainLayout,
    // exact: true,
    routes: [
      {
        path: '/',
        exact: true,
        component: lazy(() => import('./views/Home')),
      },
      {
        path: '/submit-proposal',
        exact: true,
        component: lazy(() => import('./views/SubmitProposal')),
      },
      {
        path: '/deposit',
        exact: true,
        component: lazy(() => import('./views/Deposit')),
      },
      {
        path: '/proposals',
        exact: true,
        component: lazy(() => import('./views/Proposals')),
      },
      {
        path: '/network-not-supported',
        exact: true,
        component: lazy(() => import('./views/NetworkNotSupported')),
      },
    ],
  },
];

export default routes;
