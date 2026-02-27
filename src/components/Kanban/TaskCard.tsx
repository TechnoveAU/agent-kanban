'use client';

import { useDraggable } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  commentCount: number;
  timeEstimate: string;
  assignee?: {
    name: string;
    avatar: string;
  };
  onDoubleClick?: () => void;
  onDelete?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function TaskCard({
  id,
  title,
  description,
  priority,
  tags,
  commentCount,
  timeEstimate,
  assignee,
  onDoubleClick,
  onDelete,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    // Outer wrapper: owns the droppable ref + double-click. No dnd listeners here
    // so the double-click event is never swallowed by PointerSensor.
    <div
      ref={setNodeRef}
      onDoubleClick={onDoubleClick}
      style={{ opacity: isDragging ? 0 : 1 }}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow select-none"
    >
      {/* Inner drag handle — dnd listeners live here only */}
      <div
        {...listeners}
        {...attributes}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        className="p-4"
    >
      {/* Priority + Menu row */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            priorityColors[priority]
          }`}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
          <div
            ref={menuRef}
            className="relative"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="text-gray-400 hover:text-gray-600 text-base leading-none p-0.5"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-50 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete?.();
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1H2C1.4 1 1 1.4 1 2v6c0 .6.4 1 1 1h2l2 2 2-2h2c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z" stroke="#9ca3af" strokeWidth="1" fill="none" strokeLinejoin="round" />
            </svg>
            {commentCount}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1" fill="none" />
              <path d="M6 3v3l2 1.5" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {timeEstimate}
          </span>
        </div>
        {assignee && (
          <div
            className="w-6 h-6 rounded-full bg-cover bg-center border border-gray-200"
            title={assignee.name}
            style={{ backgroundImage: `url(${assignee.avatar})` }}
          />
        )}
      </div>
      </div>
    </div>
  );
}
