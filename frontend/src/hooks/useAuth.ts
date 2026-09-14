import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import { useAuth as useAuthContext } from '@/context/AuthContext';
import { RoleName } from '@/types/user.types';
import type { RootState, AppDispatch } from '@/store';

// ============================================================================
//  HOOKS REDUX TYPÉS
// ============================================================================

/**
 * useDispatch typé pour toute l'application
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * useSelector typé pour toute l'application
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================================================
//  USE AUTH HOOK
// ============================================================================

export function useAuth() {
  const context = useAuthContext();

  const hasRole = useCallback(
    (roles: RoleName | RoleName[]): boolean => {
      if (!context.user?.role?.nom) return false;
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return rolesArray.includes(context.user.role.nom);
    },
    [context.user?.role?.nom]
  );

  const isAdmin = useMemo(
    () => context.user?.role?.nom === 'ADMIN',
    [context.user?.role?.nom]
  );

  const isStaff = useMemo(
    () => context.user?.role?.nom === 'STAFF',
    [context.user?.role?.nom]
  );

  const isFormateur = useMemo(
    () => context.user?.role?.nom === 'FORMATEUR',
    [context.user?.role?.nom]
  );

  const isParticipant = useMemo(
    () => context.user?.role?.nom === 'PARTICIPANT',
    [context.user?.role?.nom]
  );

  const isPartenaire = useMemo(
    () => context.user?.role?.nom === 'PARTENAIRE',
    [context.user?.role?.nom]
  );

  const isInternal = useMemo(
    () =>
      ['ADMIN', 'STAFF', 'FORMATEUR'].includes(
        context.user?.role?.nom || ''
      ),
    [context.user?.role?.nom]
  );

  const fullName = useMemo(() => {
    if (!context.user) return '';
    return `${context.user.prenom} ${context.user.nom}`;
  }, [context.user]);

  const initials = useMemo(() => {
    if (!context.user) return '';
    return `${context.user.prenom?.[0] || ''}${
      context.user.nom?.[0] || ''
    }`.toUpperCase();
  }, [context.user]);

  return {
    ...context,
    hasRole,
    isAdmin,
    isStaff,
    isFormateur,
    isParticipant,
    isPartenaire,
    isInternal,
    fullName,
    initials,
  };
}

export default useAuth;