import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Define the Todo type
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  orderIndex: number;
  archived: boolean; // Add archived status
}

// Function to open the database connection
async function openDb() {
  const dbPath = path.join(process.cwd(), 'todos.db');
  console.log(`Database path: ${dbPath}`); // Log the path for debugging

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create the todos table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      orderIndex INTEGER,
      archived BOOLEAN DEFAULT 0 -- Add archived column
    )
  `);

  // Check if orderIndex column exists, add if not (for migrations)
  const columns = await db.all("PRAGMA table_info(todos);");
  if (!columns.some(col => col.name === 'orderIndex')) {
    await db.exec('ALTER TABLE todos ADD COLUMN orderIndex INTEGER;');
    // Initialize orderIndex based on existing id for old rows
    await db.exec('UPDATE todos SET orderIndex = id WHERE orderIndex IS NULL;');
  }
  // Check if archived column exists, add if not (for migrations)
  if (!columns.some(col => col.name === 'archived')) {
    await db.exec('ALTER TABLE todos ADD COLUMN archived BOOLEAN DEFAULT 0;');
  }

  return db;
}

// Function to get all todos (including archived for filtering in frontend)
export async function getTodos(): Promise<Todo[]> {
  const db = await openDb();
  // Fetch all todos, order by archived status first, then orderIndex
  const todos = await db.all<Todo[]>('SELECT * FROM todos ORDER BY archived ASC, orderIndex ASC');
  await db.close();
  // Ensure boolean conversion
  return todos.map(todo => ({
    ...todo,
    completed: Boolean(todo.completed),
    archived: Boolean(todo.archived),
  }));
}

// Function to add a new todo
export async function addTodo(text: string): Promise<Todo> {
  const db = await openDb();
  // Get the current max orderIndex for non-archived items
  const maxOrder = await db.get<{ maxOrder: number | null }>(
    'SELECT MAX(orderIndex) as maxOrder FROM todos WHERE archived = 0'
  );
  const nextOrderIndex = (maxOrder?.maxOrder ?? 0) + 1;

  const result = await db.run(
    'INSERT INTO todos (text, completed, orderIndex, archived) VALUES (?, ?, ?, ?)',
    [text, false, nextOrderIndex, false] // Default archived to false
  );
  await db.close();
  if (result.lastID === undefined) {
    throw new Error('Failed to add todo: lastID is undefined');
  }
  return { id: result.lastID, text, completed: false, orderIndex: nextOrderIndex, archived: false };
}

// Function to delete a todo
export async function deleteTodo(id: number): Promise<void> {
  const db = await openDb();
  await db.run('DELETE FROM todos WHERE id = ?', id);
  await db.close();
}

// Function to toggle todo completion status
export async function toggleTodo(id: number, completed: boolean): Promise<void> {
  const db = await openDb();
  await db.run('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
  await db.close();
}

// Function to update the order of todos
export async function updateTodoOrder(todos: Pick<Todo, 'id' | 'orderIndex'>[]): Promise<void> {
    const db = await openDb();
    await db.run('BEGIN TRANSACTION');
    try {
        for (const todo of todos) {
            await db.run('UPDATE todos SET orderIndex = ? WHERE id = ?', [todo.orderIndex, todo.id]);
        }
        await db.run('COMMIT');
    } catch (error) {
        await db.run('ROLLBACK');
        console.error("Failed to update todo order:", error);
        throw error; // Re-throw the error after rollback
    } finally {
        await db.close();
    }
}

// Function to archive a todo
export async function archiveTodo(id: number): Promise<void> {
  const db = await openDb();
  await db.run('UPDATE todos SET archived = 1 WHERE id = ?', id);
  await db.close();
}
