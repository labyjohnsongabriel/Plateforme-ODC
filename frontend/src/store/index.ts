import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import formationReducer from './slices/formationSlice';
import inscriptionReducer from './slices/inscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import messagerieReducer from './slices/messagerieSlice';
import loggerMiddleware from './middleware/logger';

// ============================================================================
//  STORE CONFIGURATION
// ============================================================================

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    formations: formationReducer,
    inscriptions: inscriptionReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    messagerie: messagerieReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(loggerMiddleware),
  devTools: import.meta.env.DEV,
});

// ============================================================================
//  TYPES
// ============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;