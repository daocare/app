export const ROUTES_LOADED = 'ROUTES_LOADED';

export const load = routes => dispatch =>
  dispatch({
    type: ROUTES_LOADED,
    routes,
  });
