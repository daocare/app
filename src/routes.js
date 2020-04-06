/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import { lazy } from 'react';

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
        component: lazy(() => import('./views/Home/Home')),
      },
      {
        path: '/submit-proposal',
        exact: true,
        component: lazy(() => import('./views/SubmitProposal')),
      },
      {
        path: '/deposit',
        exact: true,
        component: lazy(() => import('./views/Deposit/Deposit')),
      },
      {
        path: '/withdraw',
        exact: true,
        component: lazy(() => import('./views/Withdraw/Withdraw')),
      },
      {
        path: '/proposals',
        exact: true,
        component: lazy(() => import('./views/Proposals/Proposals')),
      },
      {
        path: '/network-not-supported',
        exact: true,
        component: lazy(() =>
          import('./views/NetworkNotSupported/NetworkNotSupported')
        ),
      },
      {
        path: '/manually-increase-iteration',
        exact: true,
        component: lazy(() => import('./views/IncreaseIteration')),
      },
    ],
  },
];

export default routes;
