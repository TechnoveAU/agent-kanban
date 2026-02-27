'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function KanbanIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="5" height="9" rx="1" fill={active ? 'white' : '#9ca3af'} />
      <rect x="8" y="1" width="5" height="6" rx="1" fill={active ? 'white' : '#9ca3af'} />
      <rect x="8" y="9" width="5" height="4" rx="1" fill={active ? 'white' : '#9ca3af'} />
    </svg>
  );
}

function AgentsIcon({ active }: { active: boolean }) {
  const color = active ? 'white' : '#9ca3af';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="5" r="3" fill={color} />
      <path d="M2 13c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Kanban', href: '/kanban', Icon: KanbanIcon },
    { name: 'Agents', href: '/agents', Icon: AgentsIcon },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[170px] bg-white border-r border-gray-200 z-40 flex flex-col">
      {/* Logo area — same height as topbar */}
      <div className="h-[75px] flex items-center px-5 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-800 rounded-lg flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L11.5 6.5H6.5L9 2Z" fill="white" />
              <path d="M9 16L6.5 11.5H11.5L9 16Z" fill="white" opacity="0.7" />
              <path d="M2 9L6.5 6.5V11.5L2 9Z" fill="white" opacity="0.7" />
              <path d="M16 9L11.5 11.5V6.5L16 9Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">Aether</span>
        </div>
      </div>

      {/* Nav */}
      <div className="p-5 flex-1">
        {/* Main Menu Label */}
        <div className="mb-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Main Menu
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map(({ name, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-800 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon active={active} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
