import { getAgentById } from '@/lib/agents';
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
 * GET /api/[id]
 *
 * Treats [id] as an agent ID.
 * Returns the first task in `todo` status assigned to that agent
 * and transitions it to `in_progress`.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: agentId } = await params;

  const agent = getAgentById(agentId);
  if (!agent) {
    return NextResponse.json({ error: `Agent '${agentId}' not found` }, { status: 404 });
  }

  const db = getDb();

  // Find the oldest todo task assigned to this agent
  const task = db
    .prepare(
      `SELECT * FROM tasks
       WHERE agent_id = ? AND status = 'todo'
       ORDER BY created_at ASC
       LIMIT 1`,
    )
    .get(agentId) as TaskRow | undefined;

  if (!task) {
    return NextResponse.json(
      { error: `No todo tasks found for agent '${agentId}'` },
      { status: 404 },
    );
  }

  // Move to in_progress
  db.prepare(`UPDATE tasks SET status = 'in_progress' WHERE id = ?`).run(task.id);

  const updated = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(task.id) as TaskRow;

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
