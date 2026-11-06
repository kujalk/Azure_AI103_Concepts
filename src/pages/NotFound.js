import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">That page doesn't exist. It may have moved.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-azure-600 underline">Back to home</Link>
    </div>
  );
}
