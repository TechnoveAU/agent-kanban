import { AgentsView } from '@/components/Agents/AgentsView';
import { getAllAgents } from '@/lib/agents';

export default async function AgentsPage() {
  const agents = getAllAgents();

  return <AgentsView initialAgents={agents} />;
}
