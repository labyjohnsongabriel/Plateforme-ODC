import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// ============================================================================
//  BASE SELECTORS
// ============================================================================

export const selectUsers = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectUsersFilters = (state: RootState) => state.users.filters;
export const selectUsersPagination = (state: RootState) => state.users.pagination;

// ============================================================================
//  COMPUTED SELECTORS
// ============================================================================

export const selectActiveUsers = createSelector([selectUsers], (users) =>
  users.filter((u) => u.actif)
);

export const selectInactiveUsers = createSelector([selectUsers], (users) =>
  users.filter((u) => !u.actif)
);

export const selectUsersByRole = (role: string) =>
  createSelector([selectUsers], (users) =>
    users.filter((u) => u.role?.nom === role)
  );

export const selectAdminUsers = createSelector([selectUsers], (users) =>
  users.filter((u) => u.role?.nom === 'ADMIN')
);

export const selectFormateurUsers = createSelector([selectUsers], (users) =>
  users.filter((u) => u.role?.nom === 'FORMATEUR')
);

export const selectParticipantUsers = createSelector([selectUsers], (users) =>
  users.filter((u) => u.role?.nom === 'PARTICIPANT')
);

export const selectUsersCount = createSelector([selectUsers], (users) => users.length);

export const selectUserById = (id: string) =>
  createSelector([selectUsers], (users) => users.find((u) => u.id === id));

export const selectUsersSearchResults = (query: string) =>
  createSelector([selectUsers], (users) => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  });

export const selectUsersSortedByName = createSelector([selectUsers], (users) =>
  [...users].sort((a, b) => a.nom.localeCompare(b.nom))
);

export const selectUsersStats = createSelector([selectUsers], (users) => {
  const stats = {
    total: users.length,
    actifs: users.filter((u) => u.actif).length,
    inactifs: users.filter((u) => !u.actif).length,
    parRole: {
      ADMIN: users.filter((u) => u.role?.nom === 'ADMIN').length,
      STAFF: users.filter((u) => u.role?.nom === 'STAFF').length,
      FORMATEUR: users.filter((u) => u.role?.nom === 'FORMATEUR').length,
      PARTICIPANT: users.filter((u) => u.role?.nom === 'PARTICIPANT').length,
      PARTENAIRE: users.filter((u) => u.role?.nom === 'PARTENAIRE').length,
    },
  };
  return stats;
});