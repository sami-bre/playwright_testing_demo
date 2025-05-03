'use client';

import React, { useState, useMemo } from 'react';
import { Todo } from '@/lib/db';
import TodoListClient from './TodoListClient';
import ArchivedTodoList from './ArchivedTodoList';

interface TabbedTodoViewProps {
  allTodos: Todo[];
}

type Tab = 'active' | 'archived';

export default function TabbedTodoView({ allTodos }: TabbedTodoViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const { activeTodos, archivedTodos } = useMemo(() => {
    const active = allTodos.filter(todo => !todo.archived);
    const archived = allTodos.filter(todo => todo.archived);
    return { activeTodos: active, archivedTodos: archived };
  }, [allTodos]);

  const activeTabStyles = "border-blue-600 text-blue-600";
  const inactiveTabStyles = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? activeTabStyles : inactiveTabStyles}`}
            aria-current={activeTab === 'active' ? 'page' : undefined}
            data-testid="active-todos-tab"
          >
            Active Todos ({activeTodos.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'archived' ? activeTabStyles : inactiveTabStyles}`}
            aria-current={activeTab === 'archived' ? 'page' : undefined}
            data-testid="archived-todos-tab"
          >
            Archived ({archivedTodos.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div data-testid="tab-content">
        {activeTab === 'active' && <TodoListClient initialTodos={activeTodos} />}
        {activeTab === 'archived' && <ArchivedTodoList archivedTodos={archivedTodos} />}
      </div>
    </div>
  );
}
