'use client';

import { useDroppable } from '@dnd-kit/core';
import type { KanbanTask } from './KanbanBoard';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  count: number;
  tasks: KanbanTask[];
  onTaskDoubleClick?: (task: KanbanTask) => void;
  onTaskDelete?: (taskId: string) => void;
}

export function KanbanColumn({ title, status, count, tasks, onTaskDoubleClick, onTaskDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 flex flex-col min-h-96 transition-colors ${
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-gray-50'
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
          <span className="text-xs font-semibold text-gray-400">{count}</span>
        </div>
        <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors">
          <span className="text-sm leading-none">+</span>
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            onDoubleClick={() => onTaskDoubleClick?.(task)}
            onDelete={() => onTaskDelete?.(task.id)}
          />
        ))}
        {/* Drop zone placeholder when column is empty and being hovered */}
        {tasks.length === 0 && isOver && (
          <div className="h-20 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/50" />
        )}
      </div>
    </div>
  );
}
