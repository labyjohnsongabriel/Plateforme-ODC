import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// ============================================================================
//  BASE SELECTORS
// ============================================================================

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectInitialized = (state: RootState) => state.auth.initialized;

// ============================================================================
//  COMPUTED SELECTORS
// ============================================================================

export const selectUserRole = createSelector([selectUser], (user) => user?.role?.nom || null);

export const selectFullName = createSelector([selectUser], (user) =>
  user ? `${user.prenom} ${user.nom}` : ''
);

export const selectInitials = createSelector([selectUser], (user) =>
  user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : ''
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'ADMIN'
);

export const selectIsStaff = createSelector(
  [selectUserRole],
  (role) => role === 'STAFF'
);

export const selectIsFormateur = createSelector(
  [selectUserRole],
  (role) => role === 'FORMATEUR'
);

export const selectIsParticipant = createSelector(
  [selectUserRole],
  (role) => role === 'PARTICIPANT'
);

export const selectIsPartenaire = createSelector(
  [selectUserRole],
  (role) => role === 'PARTENAIRE'
);

export const selectIsInternal = createSelector([selectUserRole], (role) =>
  ['ADMIN', 'STAFF', 'FORMATEUR'].includes(role || '')
);

export const selectCanManageUsers = createSelector(
  [selectUserRole],
  (role) => role === 'ADMIN'
);

export const selectCanManageFormations = createSelector(
  [selectUserRole],
  (role) => ['ADMIN', 'STAFF'].includes(role || '')
);

export const selectCanManageSessions = createSelector(
  [selectUserRole],
  (role) => ['ADMIN', 'STAFF'].includes(role || '')
);

export const selectCanSelectCandidates = createSelector(
  [selectUserRole],
  (role) => ['ADMIN', 'STAFF'].includes(role || '')
);

export const selectCanManageEvaluations = createSelector(
  [selectUserRole],
  (role) => ['ADMIN', 'FORMATEUR'].includes(role || '')
);

export const selectCanGenerateAttestations = createSelector(
  [selectUserRole],
  (role) => ['ADMIN', 'STAFF'].includes(role || '')
);

// Helper pour vérifier un rôle
export const selectHasRole = (role: string | string[]) =>
  createSelector([selectUserRole], (userRole) => {
    const roles = Array.isArray(role) ? role : [role];
    return userRole ? roles.includes(userRole) : false;
  });

export const selectHasAnyRole = (roles: string[]) =>
  createSelector([selectUserRole], (userRole) =>
    userRole ? roles.includes(userRole) : false
  );