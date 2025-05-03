import { getTodos } from '@/lib/db';
import { addTodoAction } from './actions';
import TabbedTodoView from './TabbedTodoView'; // Import the new tabbed view
import Link from 'next/link';

export default async function Home() {
  const allTodos = await getTodos(); // Fetch all todos (active and archived)

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">My To-Do List</h1>
            <nav>
                <Link href="/about" className="text-blue-600 hover:underline">
                    About
                </Link>
            </nav>
        </div>

        {/* Add Todo Form */}
        <form action={addTodoAction} className="mb-6 flex">
          <input
            type="text"
            name="todoText"
            required
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a new todo..."
            aria-label="New todo text"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </form>

        {/* Render the Tabbed View */}
        <TabbedTodoView allTodos={allTodos} />

      </div>
    </main>
  );
}
