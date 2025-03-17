export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome Home</h1>
      <div className="space-x-4">
        <a href="/login" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Login
        </a>
        <a href="/signup" className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Signup
        </a>
      </div>
    </main>
  );
}
