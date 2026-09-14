import { useState } from 'react';
import { Search, Plus, Users, Filter, Download } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UserCard } from './UserCard';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { RoleName } from '../types/user.types';
import { useNavigate } from 'react-router-dom';

export function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    users,
    loading,
    pagination,
    updateFilters,
    changePage,
    toggleActif,
    remove,
  } = useUsers({
    search: debouncedSearch,
    role: roleFilter ? (roleFilter as RoleName) : undefined,
  });

  const handleReset = () => {
    setSearch('');
    setRoleFilter('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Utilisateurs
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination.total} utilisateur(s) • {users.length} affiché(s)
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/users/create')}
        >
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Rechercher par nom, prénom, email..."
              icon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les rôles' },
              { value: RoleName.ADMIN, label: 'Administrateurs' },
              { value: RoleName.STAFF, label: 'Staff ODC' },
              { value: RoleName.FORMATEUR, label: 'Formateurs' },
              { value: RoleName.PARTICIPANT, label: 'Participants' },
              { value: RoleName.PARTENAIRE, label: 'Partenaires' },
            ]}
          />
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des utilisateurs..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Aucun utilisateur trouvé"
          description="Essayez de modifier vos filtres ou créez un nouvel utilisateur"
          action={
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate('/users/create')}
            >
              Créer un utilisateur
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={() => navigate(`/users/${user.id}`)}
                onEdit={() => navigate(`/users/${user.id}/edit`)}
                onToggleActif={() => toggleActif(user.id, !user.actif)}
                onDelete={() => remove(user.id)}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
            />
          )}
        </>
      )}
    </div>
  );
}