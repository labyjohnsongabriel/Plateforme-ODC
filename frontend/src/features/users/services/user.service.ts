import { userApi } from '@/services/user.api';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilters,
  UserStatsByRole,
  RoleName,
} from '../types/user.types';
import type { PaginatedResponse } from '@/types/common.types';

// ============================================================================
//  USER SERVICE
// ============================================================================

export class UserService {
  /**
   * Liste des utilisateurs
   */
  static async list(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    return userApi.list(filters);
  }

  /**
   * Détail d'un utilisateur
   */
  static async getById(id: string): Promise<User> {
    return userApi.getById(id);
  }

  /**
   * Créer un utilisateur
   */
  static async create(payload: CreateUserPayload): Promise<User> {
    return userApi.create(payload);
  }

  /**
   * Mettre à jour
   */
  static async update(id: string, payload: UpdateUserPayload): Promise<User> {
    return userApi.update(id, payload);
  }

  /**
   * Supprimer
   */
  static async delete(id: string): Promise<void> {
    return userApi.delete(id);
  }

  /**
   * Activer / Désactiver
   */
  static async toggleActif(id: string, actif: boolean): Promise<User> {
    return userApi.toggleActif(id, { actif });
  }

  /**
   * Changer rôle
   */
  static async changeRole(id: string, roleNom: RoleName): Promise<User> {
    return userApi.changeRole(id, { roleNom });
  }

  /**
   * Upload avatar
   */
  static async uploadAvatar(id: string, file: File): Promise<{ url: string }> {
    return userApi.uploadAvatar(id, file);
  }

  /**
   * Statistiques par rôle
   */
  static async statsByRole(): Promise<UserStatsByRole[]> {
    return userApi.statsByRole();
  }

  /**
   * Filtrer localement
   */
  static filterUsers(users: User[], search: string): User[] {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  /**
   * Trier par nom
   */
  static sortByName(users: User[]): User[] {
    return [...users].sort((a, b) => a.nom.localeCompare(b.nom));
  }

  /**
   * Obtenir les initiales
   */
  static getInitials(user: User): string {
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }

  /**
   * Obtenir la couleur du rôle
   */
  static getRoleColor(role: RoleName): string {
    const colors: Record<RoleName, string> = {
      ADMIN: 'error',
      STAFF: 'warning',
      FORMATEUR: 'info',
      PARTICIPANT: 'success',
      PARTENAIRE: 'primary',
    };
    return colors[role] || 'primary';
  }
}