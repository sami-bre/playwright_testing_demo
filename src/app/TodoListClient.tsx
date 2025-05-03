'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/lib/db';
import { deleteTodoAction, toggleTodoAction, updateTodoOrderAction, archiveTodoAction } from './actions';

interface SortableItemProps {
  todo: Todo;
  isDragging: boolean;
}

function SortableItem({ todo, isDragging }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = async () => {
    try {
      await toggleTodoAction(todo.id, !todo.completed);
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${todo.text}"?`)) {
        try {
            await deleteTodoAction(todo.id);
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    }
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive "${todo.text}"?`)) {
        try {
            await archiveTodoAction(todo.id);
        } catch (error) {
            console.error("Failed to archive todo:", error);
        }
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      suppressHydrationWarning={true}
      className={`flex items-center justify-between p-4 mb-2 bg-white rounded shadow ${todo.completed ? 'opacity-60' : ''}`}
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-center flex-grow min-w-0 mr-2">
        <button {...listeners} className="cursor-move mr-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
          aria-label={`Mark ${todo.text} as complete`}
          data-testid={`todo-item-checkbox-${todo.id}`}
        />
        <span className={`flex-1 truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {todo.text}
        </span>
      </div>
      <div className="flex items-center flex-shrink-0">
        {todo.completed && (
          <button
            onClick={handleArchive}
            className="text-green-600 hover:text-green-800 focus:outline-none p-1 rounded hover:bg-green-100 mr-2"
            aria-label={`Archive ${todo.text}`}
            data-testid={`todo-item-archive-button-${todo.id}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        )}
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 focus:outline-none p-1 rounded hover:bg-red-100"
          aria-label={`Delete ${todo.text}`}
          data-testid={`todo-item-delete-button-${todo.id}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}

interface TodoListClientProps {
  initialTodos: Todo[];
}

export default function TodoListClient({ initialTodos }: TodoListClientProps) {
  const [activeTodos, setActiveTodos] = useState<Todo[]>(initialTodos);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    setActiveTodos(initialTodos);
  }, [initialTodos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = activeTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = activeTodos.findIndex((todo) => todo.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(activeTodos, oldIndex, newIndex);
        setActiveTodos(newOrder);

        const updatedOrderForServer = newOrder
            .filter(todo => !todo.archived)
            .map((todo, index) => ({
                id: todo.id,
                orderIndex: index + 1,
            }));

        try {
          await updateTodoOrderAction(updatedOrderForServer);
        } catch (error) {
          console.error("Failed to update todo order:", error);
          setActiveTodos(activeTodos);
        }
      }
    }
  }

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  const incompleteTodos = activeTodos.filter(todo => !todo.completed);
  const completedTodos = activeTodos.filter(todo => todo.completed);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-700" data-testid="incomplete-todos-heading">To Do</h2>
      {incompleteTodos.length === 0 ? (
          <p className="text-gray-500 italic" data-testid="no-incomplete-todos-message">Nothing to do!</p>
      ) : (
        <SortableContext items={incompleteTodos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
            <ul className="mb-6" data-testid="incomplete-todo-list">
            {incompleteTodos.map((todo) => (
                <SortableItem key={todo.id} todo={todo} isDragging={activeId === todo.id} />
            ))}
            </ul>
        </SortableContext>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-700" data-testid="completed-todos-heading">Completed</h2>
      {completedTodos.length === 0 ? (
          <p className="text-gray-500 italic" data-testid="no-completed-todos-message">No completed items yet.</p>
      ) : (
        <SortableContext items={completedTodos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-4" data-testid="completed-todo-list">
            {completedTodos.map((todo) => (
                <SortableItem key={todo.id} todo={todo} isDragging={activeId === todo.id} />
            ))}
            </ul>
        </SortableContext>
      )}
    </DndContext>
  );
}
