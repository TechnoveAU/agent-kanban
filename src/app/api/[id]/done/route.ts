import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string;
  comment_count: number;
  time_estimate: string;
  assignee_name: string | null;
  assignee_avatar: string | null;
  agent_id: string | null;
  created_at: string;
}

/**
 * POST /api/[id]/done
 *
 * Treats [id] as a task ID and marks that task as `done`.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: taskId } = await params;

  const db = getDb();

  const task = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(taskId) as TaskRow | undefined;

  if (!task) {
    return NextResponse.json({ error: `Task '${taskId}' not found` }, { status: 404 });
  }

  if (task.status === 'done') {
    return NextResponse.json({ error: `Task '${taskId}' is already done` }, { status: 409 });
  }

  db.prepare(`UPDATE tasks SET status = 'done' WHERE id = ?`).run(taskId);

  const updated = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(taskId) as TaskRow;

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    status: updated.status,
    priority: updated.priority,
    tags: JSON.parse(updated.tags) as string[],
    commentCount: updated.comment_count,
    timeEstimate: updated.time_estimate,
    agentId: updated.agent_id ?? undefined,
    assignee:
      updated.assignee_name && updated.assignee_avatar
        ? { name: updated.assignee_name, avatar: updated.assignee_avatar }
        : undefined,
  });
}
