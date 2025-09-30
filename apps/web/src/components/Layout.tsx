import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rates', label: 'Rates' },
  { to: '/rates/new', label: 'New Rate Request' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/itineraries', label: 'Itineraries' },
  { to: '/notifications', label: 'Notifications' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Export Pricing Portal</h1>
            <p className="text-sm text-slate-500">Unified workflows for SP, Pricing & Operations</p>
          </div>
          <NotificationBell />
        </div>
        <nav className="border-t border-slate-200 bg-slate-50">
          <ul className="mx-auto flex max-w-7xl gap-4 px-6 py-2 text-sm font-medium text-slate-600">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 transition ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-200'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
