
interface ErrorBoundaryProps {
  error: Error | null;
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="p-4 bg-red-50 text-red-800 rounded-md">
      <h1 className="text-lg font-semibold mb-2">Error</h1>
      <p>{error?.message || 'An unexpected error occurred'}</p>
    </div>
  );
}