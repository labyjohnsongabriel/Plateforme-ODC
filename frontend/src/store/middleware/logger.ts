import type { Middleware } from '@reduxjs/toolkit';

// ============================================================================
//  LOGGER MIDDLEWARE
// ============================================================================

const isDevelopment = import.meta.env.DEV;

export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (!isDevelopment) return next(action);

  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  const actionType = action.type;

  // Ignorer certaines actions pour éviter le spam
  const ignoredActions = ['persist/', '@@INIT', '@@redux/'];

  if (ignoredActions.some((prefix) => actionType.startsWith(prefix))) {
    return result;
  }

  // Log groupé
  console.groupCollapsed(`%c${actionType}`, 'color: #FF7900; font-weight: bold');

  console.log('%cAction', 'color: #9E9E9E; font-weight: bold', action);

  if (prevState !== nextState) {
    const changedSlices: string[] = [];
    Object.keys(nextState).forEach((key) => {
      if (prevState[key] !== nextState[key]) {
        changedSlices.push(key);
      }
    });

    changedSlices.forEach((slice) => {
      console.log(
        `%cState.${slice}`,
        'color: #0277BD; font-weight: bold',
        {
          prev: prevState[slice],
          next: nextState[slice],
        }
      );
    });
  }

  console.groupEnd();

  return result;
};

export default loggerMiddleware;