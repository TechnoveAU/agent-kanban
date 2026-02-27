'use client';

import { deleteAgent } from '@/app/actions/agents';
import type { Agent } from '@/lib/agents';
import { useState } from 'react';
import { EditAgentModal } from './EditAgentModal';
import { NewAgentModal } from './NewAgentModal';

interface AgentsViewProps {
  initialAgents: Agent[];
}

export function AgentsView({ initialAgents }: AgentsViewProps) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const handleCreated = (agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
  };

  const handleUpdated = (oldId: string, updated: Agent) => {
    setAgents((prev) => prev.map((a) => (a.id === oldId ? updated : a)));
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your AI agents.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Agent
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{agent.name}</span>
                </td>

                {/* ID badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                    {agent.id}
                  </span>
                </td>

                {/* Description */}
                <td className="px-6 py-4 text-gray-500 max-w-sm">
                  <p className="line-clamp-2">{agent.description}</p>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      aria-label="Edit agent"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10.586 1.586a2 2 0 0 1 2.828 2.828l-8.5 8.5A1 1 0 0 1 4.5 13H2a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 .293-.707l8.293-8.207Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Delete agent"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 1h5a1 1 0 0 1 1 1v1H4V2a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <path d="M2 4h11M4 4l.786 9.43A1 1 0 0 0 5.78 14.5h3.44a1 1 0 0 0 .994-.93L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 7v4M9 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {agents.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">
            No agents yet. Add your first one.
          </div>
        )}
      </div>

      {modalOpen && (
        <NewAgentModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {editingAgent && (
        <EditAgentModal
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onUpdated={(oldId, updated) => handleUpdated(oldId, updated)}
        />
      )}
    </div>
  );
}
