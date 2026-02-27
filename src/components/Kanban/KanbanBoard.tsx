'use client';

import { deleteTask, updateTaskStatus } from '@/app/actions/tasks';
import type { TaskStatus } from '@/lib/tasks';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useState } from 'react';
import { EditTaskModal } from './EditTaskModal';
import { KanbanColumn } from './KanbanColumn';
import { NewTaskModal } from './NewTaskModal';
import { TaskCard } from './TaskCard';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  agentId?: string;
  tags: string[];
  commentCount: number;
  timeEstimate: string;
  assignee?: { name: string; avatar: string };
}

export interface KanbanColumnDef {
  title: string;
  status: string;
  tasks: KanbanTask[];
}

interface KanbanBoardProps {
  title: string;
  subtitle: string;
  columns: KanbanColumnDef[];
  agents: { id: string; name: string }[];
}

export function KanbanBoard({ title, subtitle, columns: initialColumns, agents }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

  const handleTaskCreated = useCallback((task: KanbanTask & { status: string }) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.status === task.status ? { ...col, tasks: [...col.tasks, task] } : col
      )
    );
  }, []);

  const handleTaskDoubleClick = useCallback((task: KanbanTask) => {
    setEditingTask(task);
  }, []);

  const handleTaskUpdated = useCallback((updated: KanbanTask) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      }))
    );
  }, []);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({ ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }))
    );
    await deleteTask(taskId);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = columns.flatMap((c) => c.tasks).find((t) => t.id === String(event.active.id));
      setActiveTask(task ?? null);
    },
    [columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      if (!over) return;

      const taskId = String(active.id);
      const newStatus = String(over.id) as TaskStatus;

      const sourceColIdx = columns.findIndex((c) => c.tasks.some((t) => t.id === taskId));
      if (sourceColIdx === -1) return;
      if (columns[sourceColIdx].status === newStatus) return;

      const destColIdx = columns.findIndex((c) => c.status === newStatus);
      if (destColIdx === -1) return;

      // Optimistic UI update
      setColumns((prev) => {
        const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
        const taskIdx = next[sourceColIdx].tasks.findIndex((t) => t.id === taskId);
        const [task] = next[sourceColIdx].tasks.splice(taskIdx, 1);
        next[destColIdx].tasks.push(task);
        return next;
      });

      // Persist to SQLite
      await updateTaskStatus(taskId, newStatus);
    },
    [columns]
  );

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-gray-600 text-sm">{subtitle}</p>
          </div>
          <button
            onClick={() => setNewModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            + New Task
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-5 gap-4 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                count={column.tasks.length}
                tasks={column.tasks}
                onTaskDoubleClick={handleTaskDoubleClick}
                onTaskDelete={handleTaskDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rendered into a portal — floats above all overflow/stacking contexts */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeTask ? (
          <div className="rotate-1 shadow-2xl w-full">
            <TaskCard {...activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {/* New Task Modal */}
    {newModalOpen && (
      <NewTaskModal
        agents={agents}
        onClose={() => setNewModalOpen(false)}
        onCreated={handleTaskCreated}
      />
    )}

    {/* Edit Task Modal */}
    {editingTask && (
      <EditTaskModal
        task={editingTask}
        agents={agents}
        onClose={() => setEditingTask(null)}
        onUpdated={(updated) => {
          handleTaskUpdated(updated);
          setEditingTask(null);
        }}
      />
    )}
  </>);
}
