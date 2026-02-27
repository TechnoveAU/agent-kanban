---
name: kanban-task
description: Fetch the next todo Kanban task assigned to this agent and mark tasks as done via the Kanban board API.
---

# Kanban Task Skill

This skill teaches you how to interact with the Kanban board API to pick up work
and report completion.

## Base URL

The Kanban board runs at `http://localhost:3002` by default. Substitute the
correct host/port if it is deployed elsewhere.

---

## 1. Get the next task

**When to use:** At the start of a work session, or whenever you need a new task
to work on.

```
GET http://localhost:3002/api/<YOUR_AGENT_ID>
```

- Replace `<YOUR_AGENT_ID>` with your assigned agent ID (e.g. `agent_abc123`).
- The server finds the **oldest task** in the `todo` column that belongs to you,
  moves it to **`in_progress`**, and returns it.

### Success response (200)

```json
{
  "id": "task_1234567890_ab1cd",
  "title": "API Authentication",
  "description": "Implement OAuth2 flow for third-party integration",
  "status": "in_progress",
  "priority": "high",
  "tags": ["Security", "Infra"],
  "commentCount": 3,
  "timeEstimate": "2d",
  "agentId": "agent_abc123"
}
```

Save the `id` field — you will need it to mark the task done.

### Error responses

| Status | Meaning |
|--------|---------|
| 404 | Agent ID not found **or** no `todo` tasks are assigned to you. Wait for a task to be added, or confirm your agent ID is correct. |

---

## 2. Mark a task as done

**When to use:** Once you have fully completed the work for the current task.

```
POST http://localhost:3002/api/<TASK_ID>/done
```

- Replace `<TASK_ID>` with the `id` returned in step 1 (e.g. `task_1234567890_ab1cd`).
- No request body is required.
- The server moves the task to the **`done`** column and returns the updated task.

### Success response (200)

```json
{
  "id": "task_1234567890_ab1cd",
  "title": "API Authentication",
  "description": "Implement OAuth2 flow for third-party integration",
  "status": "done",
  "priority": "high",
  "tags": ["Security", "Infra"],
  "commentCount": 3,
  "timeEstimate": "2d",
  "agentId": "agent_abc123"
}
```

### Error responses

| Status | Meaning |
|--------|---------|
| 404 | Task ID not found. Double-check the ID from step 1. |
| 409 | Task is already marked done. No action needed. |

---

## Typical workflow

1. Call **GET /api/\<YOUR_AGENT_ID\>** to claim your next task.
2. Read `title` and `description` to understand what needs to be done.
3. Complete the work.
4. Call **POST /api/\<TASK_ID\>/done** with the `id` from step 1.
5. Repeat from step 1 to pick up the next task.

If step 1 returns a 404 ("No todo tasks found"), there is nothing queued for
you right now. You can poll periodically or wait to be notified.
