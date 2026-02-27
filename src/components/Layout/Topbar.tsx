'use client';


interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  health?: 'healthy' | 'unhealthy';
  breadcrumbs?: BreadcrumbItem[];
}

export function Topbar({ health = 'healthy', breadcrumbs = [] }: TopbarProps) {
  return (
    <div className="fixed top-0 left-[170px] right-0 h-[75px] bg-white border-b border-gray-200 z-30">
      <div className="h-full flex items-center justify-between px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-gray-300">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-400'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Health Badge */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              health === 'healthy' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium text-gray-700">Health</span>
        </div>
      </div>
    </div>
  );
}
