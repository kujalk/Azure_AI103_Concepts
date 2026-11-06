import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import modules, { pathFor } from '../data/modules';
import domains from '../data/domains';
import questions from '../data/questions';
import { getScores } from '../components/progress';

const facts = [
  ['Credential', 'Azure AI Apps and Agents Developer Associate'],
  ['To pass', '700 or higher'],
  ['Expected language', 'Python'],
  ['Skills dated', 'April 16, 2026'],
];

export default function Home() {
  const [scores, setScores] = useState({});
  useEffect(() => { setScores(getScores()); }, []);
  const totalQuestions = Object.values(questions).reduce((n, list) => n + list.length, 0);
  const featured = modules.filter(m => m.featured);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 lg:pt-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-azure-600">Exam AI-103</p>
      <h1 className="mt-1 text-4xl font-bold text-slate-900">Developing AI Apps and Agents on Azure</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
        A study guide organised around Microsoft's official skills list. {modules.length} modules cover every skill, with interactive tools and {totalQuestions} scenario questions.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/exam-guide" className="rounded-lg bg-azure-500 px-4 py-2 font-semibold text-white hover:bg-azure-600">See the exam map</Link>
        <Link to="/mock-exam" className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 hover:border-azure-500">Take a practice exam</Link>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Start with these</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {featured.map(m => (
          <Link key={m.id} to={pathFor(m.id)} className="rounded-xl border-2 border-azure-100 bg-azure-50 p-4 hover:border-azure-500">
            <div className="font-bold text-slate-900">{m.icon} {m.title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{m.summary}</p>
          </Link>
        ))}
      </div>

      {domains.map(d => (
        <section key={d.id} className="mt-10" aria-labelledby={`domain-${d.id}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`domain-${d.id}`} className="text-xl font-bold text-slate-900">{d.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.badge}`}>{d.weight} of exam</span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modules.filter(m => m.domain === d.id).map(m => (
              <Link key={m.id} to={pathFor(m.id)} className={`flex flex-col rounded-lg border-t-4 bg-white p-4 shadow-sm hover:shadow ${d.border}`}>
                <div className="font-semibold text-slate-900">{m.icon} {m.title}</div>
                <p className="mt-1 flex-grow text-sm leading-6 text-slate-600">{m.summary}</p>
                {scores[m.id] !== undefined && <p className={`mt-2 text-xs font-semibold ${d.text}`}>Best quiz score: {scores[m.id]}%</p>}
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-14 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">
        An unofficial study aid, not affiliated with Microsoft. Practice questions are original and aren't real exam questions. Always check the <a className="text-azure-600 underline" href="https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-103" target="_blank" rel="noreferrer">official study guide</a>. Content last reviewed November 2026.
      </footer>
    </div>
  );
}
