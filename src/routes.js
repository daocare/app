/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import { lazy } from 'react';

import Layout from './layouts/Layout';

const routes = [
  {
    path: '/',
    component: Layout,
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
        path: '/withdraw',
        exact: true,
        component: lazy(() => import('./views/Withdraw')),
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
      {
        path: '/manually-increase-iteration',
        exact: true,
        component: lazy(() => import('./views/IncreaseIteration')),
      },
    ],
  },
];

export default routes;
