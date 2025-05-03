'use server';

import { revalidatePath } from 'next/cache';
import { addTodo as dbAddTodo, deleteTodo as dbDeleteTodo, toggleTodo as dbToggleTodo, updateTodoOrder as dbUpdateTodoOrder, archiveTodo as dbArchiveTodo, Todo } from '@/lib/db';

export async function addTodoAction(formData: FormData) {
  const text = formData.get('todoText') as string;
  if (text.trim()) {
    await dbAddTodo(text.trim());
    revalidatePath('/'); // Revalidate the home page cache
  }
}

export async function deleteTodoAction(id: number) {
  await dbDeleteTodo(id);
  revalidatePath('/');
}

export async function toggleTodoAction(id: number, completed: boolean) {
  await dbToggleTodo(id, completed);
  revalidatePath('/');
}

export async function updateTodoOrderAction(todos: Pick<Todo, 'id' | 'orderIndex'>[]) {
    await dbUpdateTodoOrder(todos);
    revalidatePath('/');
}

export async function archiveTodoAction(id: number) {
  await dbArchiveTodo(id);
  revalidatePath('/'); // Revalidate to update both active and archived lists
}
