'use server';

import type { Agent, CreateAgentInput, UpdateAgentInput } from '@/lib/agents';
import { createAgent as dbCreateAgent, deleteAgent as dbDeleteAgent, updateAgent as dbUpdateAgent, getAllAgents } from '@/lib/agents';
import { revalidatePath } from 'next/cache';

export async function fetchAgents(): Promise<Agent[]> {
  return getAllAgents();
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const agent = dbCreateAgent(input);
  revalidatePath('/agents');
  return agent;
}

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  const agent = dbUpdateAgent(id, input);
  revalidatePath('/agents');
  return agent;
}

export async function deleteAgent(id: string): Promise<void> {
  dbDeleteAgent(id);
  revalidatePath('/agents');
}
