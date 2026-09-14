import { Outlet } from 'react-router-dom';
import { HeaderPublic } from './HeaderPublic';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-odc-bg-light dark:bg-odc-bg-dark">
      <HeaderPublic />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}