import { Outlet } from 'react-router-dom';
import TopNavigation from './TopNavigation';

export default function Layout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col">
      <TopNavigation />
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
