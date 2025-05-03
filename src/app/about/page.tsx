import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">About This App</h1>
            <nav>
                <Link href="/" className="text-blue-600 hover:underline">
                    Home
                </Link>
            </nav>
        </div>
        <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-700">
                This is a simple To-Do application built with Next.js, TypeScript, Tailwind CSS, and SQLite.
                It demonstrates the use of Next.js Server Components and Server Actions for data fetching and mutations.
                The list is re-orderable using the @dnd-kit library.
            </p>
            <p className="mt-4 text-gray-700">
                This app was created as a target for demonstrating Playwright end-to-end testing.
            </p>
        </div>
      </div>
    </main>
  );
}
