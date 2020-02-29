/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';

import MainLayout from './layouts/Main';

const routes = [
  {
    path: '/',
    component: MainLayout,
    exact: true,
    routes: [
      {
        path: '/',
        exact: true,
        component: lazy(() => import('./views/Home')),
      },
    ],
  },
];

export default routes;
