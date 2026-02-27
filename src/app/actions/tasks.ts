'use server';

import { getDb } from '@/lib/db';
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '@/lib/tasks';
import { createTask as dbCreateTask, updateTask as dbUpdateTask } from '@/lib/tasks';
import { revalidatePath } from 'next/cache';

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
  const db = getDb();
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(newStatus, taskId);
  revalidatePath('/kanban');
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const task = dbCreateTask(input);
  revalidatePath('/kanban');
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const task = dbUpdateTask(id, input);
  revalidatePath('/kanban');
  return task;
}
