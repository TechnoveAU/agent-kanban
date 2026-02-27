'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  health?: 'healthy' | 'unhealthy';
  breadcrumbs?: BreadcrumbItem[];
}

export function MainLayout({ children, health = 'healthy', breadcrumbs = [] }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Topbar health={health} breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 pt-[75px]">
        <Sidebar />

        <div className="flex-1 ml-[170px] overflow-auto bg-white">
          <div className="min-h-full mx-auto max-w-[1240px] w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
