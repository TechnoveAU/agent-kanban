import { KanbanBoard } from '@/components/Kanban';
import { getAllAgents } from '@/lib/agents';
import { getAllTasksByStatus } from '@/lib/tasks';

export default async function KanbanPage() {
  const [tasksByStatus, agents] = [getAllTasksByStatus(), getAllAgents()];

  const columns = [
    { title: 'BACKLOG',        status: 'backlog',     tasks: tasksByStatus.backlog },
    { title: 'TODO',           status: 'todo',        tasks: tasksByStatus.todo },
    { title: 'IN PROGRESS',    status: 'in_progress', tasks: tasksByStatus.in_progress },
    { title: 'PENDING REVIEW', status: 'pending',     tasks: tasksByStatus.pending },
    { title: 'DONE',           status: 'done',        tasks: tasksByStatus.done },
  ];

  return (
    <KanbanBoard
      title="Main Board"
      subtitle="Manage and monitor agent-led workflow cycles."
      columns={columns}
      agents={agents}
    />
  );
}
