import { lazy } from 'react';
import type { ComponentType } from 'react';
import { PERMISSIONS } from '@/config/permissions.config';
import type { Permission } from '@/config/permissions.config';

// ============================================================================
//  TYPES
// ============================================================================

export interface RouteConfig {
  path: string;
  component: ComponentType;
  protected?: boolean;
  permission?: Permission | Permission[];
  title?: string;
}

// ============================================================================
//  LAZY LOADS
// ============================================================================

// ---- PUBLIC ----
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));

// ---- AUTH ----
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// ---- PROTECTED ----
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const FormationsPage = lazy(() => import('@/pages/formations/FormationsPage'));
const FormationDetailPage = lazy(() => import('@/pages/formations/FormationDetailPage'));
const FormationCreatePage = lazy(() => import('@/pages/formations/FormationCreatePage'));
const FormationEditPage = lazy(() => import('@/pages/formations/FormationEditPage'));
const SessionsPage = lazy(() => import('@/pages/sessions/SessionsPage'));
const SessionDetailPage = lazy(() => import('@/pages/sessions/SessionDetailPage'));
const SessionCreatePage = lazy(() => import('@/pages/sessions/SessionCreatePage'));
const InscriptionsPage = lazy(() => import('@/pages/inscriptions/InscriptionsPage'));
const SelectionPage = lazy(() => import('@/pages/inscriptions/SelectionPage'));
const PresencesPage = lazy(() => import('@/pages/presences/PresencesPage'));
const ScanQrPage = lazy(() => import('@/pages/presences/ScanQrPage'));
const PresenceStatsPage = lazy(() => import('@/pages/presences/PresenceStatsPage'));
const EvaluationsPage = lazy(() => import('@/pages/evaluations/EvaluationsPage'));
const NotesPage = lazy(() => import('@/pages/evaluations/NotesPage'));
const AttestationsPage = lazy(() => import('@/pages/attestations/AttestationsPage'));
const MessageriePage = lazy(() => import('@/pages/messagerie/MessageriePage'));
const ReseautagePage = lazy(() => import('@/pages/reseautage/ReseautagePage'));
const ProfilPage = lazy(() => import('@/pages/profile/ProfilPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const UserCreatePage = lazy(() => import('@/pages/users/UserCreatePage'));
const UserEditPage = lazy(() => import('@/pages/users/UserEditPage'));
const PartenairesPage = lazy(() => import('@/pages/partenaires/PartenairesPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

// ---- ERRORS ----
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('@/pages/errors/ServerErrorPage'));

// ============================================================================
//  🌍 ROUTES PUBLIQUES (accessibles à TOUS, connecté ou non)
// ============================================================================

export const PUBLIC_ROUTES: RouteConfig[] = [
  { path: '/', component: HomePage, title: 'Accueil' },
  { path: '/about', component: AboutPage, title: 'À propos' },
  { path: '/contact', component: ContactPage, title: 'Contact' },
  { path: '/terms', component: TermsPage, title: 'Conditions' },
  { path: '/privacy', component: PrivacyPage, title: 'Confidentialité' },
];

// ============================================================================
//  🔓 ROUTES AUTH (redirige vers /dashboard si DÉJÀ CONNECTÉ)
// ============================================================================

export const AUTH_ROUTES: RouteConfig[] = [
  { path: '/login', component: LoginPage, title: 'Connexion' },
  { path: '/register', component: RegisterPage, title: 'Inscription' },
  { path: '/forgot-password', component: ForgotPasswordPage, title: 'Mot de passe oublié' },
  { path: '/reset-password', component: ResetPasswordPage, title: 'Réinitialiser' },
];

// ============================================================================
//  🔒 ROUTES PROTÉGÉES (nécessitent auth + permission)
// ============================================================================

export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    component: DashboardPage,
    protected: true,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
];

export const FORMATION_ROUTES: RouteConfig[] = [
  {
    path: '/formations',
    component: FormationsPage,
    protected: true,
    permission: PERMISSIONS.FORMATIONS_VIEW,
  },
  {
    path: '/formations/create',
    component: FormationCreatePage,
    protected: true,
    permission: PERMISSIONS.FORMATIONS_CREATE,
  },
  {
    path: '/formations/:id/edit',
    component: FormationEditPage,
    protected: true,
    permission: PERMISSIONS.FORMATIONS_EDIT,
  },
  {
    path: '/formations/:id',
    component: FormationDetailPage,
    protected: true,
    permission: PERMISSIONS.FORMATIONS_VIEW,
  },
];

export const SESSION_ROUTES: RouteConfig[] = [
  { path: '/sessions', component: SessionsPage, protected: true, permission: PERMISSIONS.SESSIONS_VIEW },
  { path: '/sessions/create', component: SessionCreatePage, protected: true, permission: PERMISSIONS.SESSIONS_CREATE },
  { path: '/sessions/:id', component: SessionDetailPage, protected: true, permission: PERMISSIONS.SESSIONS_VIEW },
];

export const INSCRIPTION_ROUTES: RouteConfig[] = [
  {
    path: '/inscriptions',
    component: InscriptionsPage,
    protected: true,
    permission: [PERMISSIONS.INSCRIPTIONS_VIEW_ALL, PERMISSIONS.INSCRIPTIONS_VIEW_OWN],
  },
  {
    path: '/inscriptions/selection',
    component: SelectionPage,
    protected: true,
    permission: PERMISSIONS.INSCRIPTIONS_SELECT,
  },
];

export const PRESENCE_ROUTES: RouteConfig[] = [
  {
    path: '/presences',
    component: PresencesPage,
    protected: true,
    permission: [PERMISSIONS.PRESENCES_VIEW_ALL, PERMISSIONS.PRESENCES_VIEW_OWN, PERMISSIONS.PRESENCES_SCAN],
  },
  { path: '/presences/scan', component: ScanQrPage, protected: true, permission: PERMISSIONS.PRESENCES_SCAN },
  { path: '/presences/stats', component: PresenceStatsPage, protected: true, permission: PERMISSIONS.PRESENCES_VIEW_ALL },
];

export const EVALUATION_ROUTES: RouteConfig[] = [
  { path: '/evaluations', component: EvaluationsPage, protected: true, permission: PERMISSIONS.EVALUATIONS_VIEW },
  { path: '/evaluations/notes', component: NotesPage, protected: true, permission: PERMISSIONS.EVALUATIONS_GRADE },
];

export const ATTESTATION_ROUTES: RouteConfig[] = [
  {
    path: '/attestations',
    component: AttestationsPage,
    protected: true,
    permission: [PERMISSIONS.ATTESTATIONS_VIEW_ALL, PERMISSIONS.ATTESTATIONS_VIEW_OWN],
  },
];

export const MESSAGERIE_ROUTES: RouteConfig[] = [
  { path: '/messagerie', component: MessageriePage, protected: true, permission: PERMISSIONS.MESSAGERIE_USE },
];

export const RESEAUTAGE_ROUTES: RouteConfig[] = [
  { path: '/reseautage', component: ReseautagePage, protected: true, permission: PERMISSIONS.RESEAUTAGE_USE },
];

export const PROFILE_ROUTES: RouteConfig[] = [
  { path: '/profile', component: ProfilPage, protected: true, permission: PERMISSIONS.DASHBOARD_VIEW },
];

export const USER_ROUTES: RouteConfig[] = [
  { path: '/users', component: UsersPage, protected: true, permission: PERMISSIONS.USERS_VIEW },
  { path: '/users/create', component: UserCreatePage, protected: true, permission: PERMISSIONS.USERS_CREATE },
  { path: '/users/:id/edit', component: UserEditPage, protected: true, permission: PERMISSIONS.USERS_EDIT },
  { path: '/users/:id', component: UserDetailPage, protected: true, permission: PERMISSIONS.USERS_VIEW },
];

export const PARTENAIRE_ROUTES: RouteConfig[] = [
  { path: '/partenaires', component: PartenairesPage, protected: true, permission: PERMISSIONS.PARTENAIRES_VIEW },
];

export const SETTINGS_ROUTES: RouteConfig[] = [
  { path: '/settings', component: SettingsPage, protected: true, permission: PERMISSIONS.SETTINGS_VIEW },
];

// ============================================================================
//  ❌ ROUTES D'ERREUR
// ============================================================================

export const ERROR_ROUTES: RouteConfig[] = [
  { path: '/403', component: ForbiddenPage, title: 'Accès refusé' },
  { path: '/404', component: NotFoundPage, title: 'Page introuvable' },
  { path: '/500', component: ServerErrorPage, title: 'Erreur serveur' },
];