import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  Bookmark,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from '@/components/common/Dropdown';
import { cn } from '@/utils/cn';

interface ProfileMenuProps {
  user: any;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const { logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('À bientôt !');
    navigate('/login');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'STAFF':
        return 'warning';
      case 'FORMATEUR':
        return 'info';
      case 'PARTICIPANT':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          className={cn(
            'flex items-center gap-2 p-1.5 pr-2 rounded-xl',
            'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20',
            'transition-colors'
          )}
        >
          <Avatar
            src={user?.photoUrl}
            name={`${user?.prenom} ${user?.nom}`}
            size="sm"
            status="online"
          />
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark leading-tight">
              {user?.prenom}
            </div>
            <div className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {user?.role?.nom}
            </div>
          </div>
          <ChevronDown
            size={14}
            className="hidden md:block text-odc-text-muted-light dark:text-odc-text-muted-dark"
          />
        </button>
      }
    >
      {/* User info */}
      <div className="px-3 py-3 mb-1">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.photoUrl}
            name={`${user?.prenom} ${user?.nom}`}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-odc-text-light dark:text-odc-text-dark truncate">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
              {user?.email}
            </div>
            <Badge
              variant={getRoleBadgeVariant(user?.role?.nom) as any}
              size="xs"
              className="mt-1"
            >
              <Shield size={10} />
              {user?.role?.nom}
            </Badge>
          </div>
        </div>
      </div>

      <DropdownDivider />

      <DropdownLabel>Mon compte</DropdownLabel>
      <Link to="/profile">
        <DropdownItem icon={<User size={16} />}>Mon profil</DropdownItem>
      </Link>
      <Link to="/settings">
        <DropdownItem icon={<Settings size={16} />}>Paramètres</DropdownItem>
      </Link>
      <DropdownItem icon={<Bookmark size={16} />}>Mes favoris</DropdownItem>

      <DropdownDivider />

      <DropdownLabel>Préférences</DropdownLabel>
      <DropdownItem
        icon={mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        onClick={toggleTheme}
      >
        {mode === 'light' ? 'Mode sombre' : 'Mode clair'}
      </DropdownItem>
      <DropdownItem icon={<HelpCircle size={16} />}>Aide</DropdownItem>

      <DropdownDivider />

      <DropdownItem
        icon={<LogOut size={16} />}
        onClick={handleLogout}
        danger
      >
        Déconnexion
      </DropdownItem>
    </Dropdown>
  );
}