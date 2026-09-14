import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { UserCard } from '@/features/users/components/UserCard';
import { Can } from '@/components/common/Can';
import { PERMISSIONS } from '@/config/permissions.config';
import { userApi } from '@/services/user.api';
import { useDebounce } from '@/hooks/useDebounce';
import type { User } from '@/features/users/types/user.types';

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await userApi.list({
          page,
          limit: 10,
          search: debouncedSearch,
        });
        setUsers(res.data ?? []);
        setPagination({
          total: res.pagination?.total ?? 0,
          totalPages: res.pagination?.totalPages ?? 0,
        });
      } catch (err: any) {
        toast.error(err?.message ?? 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, [page, debouncedSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Utilisateurs
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}
          </p>
        </div>

        <Can permission={PERMISSIONS.USERS_CREATE}>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/users/create')}
          >
            Nouvel utilisateur
          </Button>
        </Can>
      </div>

      {/* Recherche */}
      <Card padding="md">
        <Input
          placeholder="Rechercher par nom, email, ville..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Aucun utilisateur"
          description="Aucun utilisateur ne correspond à votre recherche"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => navigate(`/users/${user.id}`)}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}