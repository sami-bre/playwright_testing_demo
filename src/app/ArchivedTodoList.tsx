'use client';

import React from 'react';
import { Todo } from '@/lib/db';
import { deleteTodoAction } from './actions'; // Assuming you might want to delete archived items

interface ArchivedTodoListProps {
  archivedTodos: Todo[];
}

export default function ArchivedTodoList({ archivedTodos }: ArchivedTodoListProps) {

  const handleDelete = async (id: number, text: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the archived item "${text}"?`)) {
        try {
            await deleteTodoAction(id);
            // Revalidation happens in the action
        } catch (error) {
            console.error("Failed to delete archived todo:", error);
            // Optionally: show an error message to the user
        }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Archived Items</h2>
      {archivedTodos.length === 0 ? (
        <p className="text-gray-500 italic">No archived items.</p>
      ) : (
        <ul>
          {archivedTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-4 mb-2 bg-gray-100 rounded shadow-sm opacity-70"
              suppressHydrationWarning={true} // Keep suppression if needed
            >
              <span className="flex-1 line-through text-gray-500 truncate mr-2">
                {todo.text}
              </span>
              <button
                onClick={() => handleDelete(todo.id, todo.text)}
                className="text-red-500 hover:text-red-700 focus:outline-none p-1 rounded hover:bg-red-100 flex-shrink-0"
                aria-label={`Delete archived item ${todo.text}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
