import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <Outlet />
    </div>
  );
}
