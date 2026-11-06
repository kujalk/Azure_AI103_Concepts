import { useState } from 'react';
import { Link } from 'react-router-dom';
import modules, { moduleById, pathFor } from '../data/modules';
import domains, { domainById } from '../data/domains';
import questions from '../data/questions';
import { Question } from '../components/Quiz';

const pick = (list, count) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
};

// Draws questions in proportion to the midpoint of each domain's official weight.
export function buildExam(total) {
  const midpoints = domains.map(d => (d.low + d.high) / 2);
  const sum = midpoints.reduce((a, b) => a + b, 0);
  const picked = domains.flatMap((d, i) => {
    const pool = modules.filter(m => m.domain === d.id).flatMap(m => questions[m.id].map(q => ({ ...q, moduleId: m.id, domainId: d.id })));
    return pick(pool, Math.min(pool.length, Math.round((midpoints[i] / sum) * total)));
  });
  return pick(picked, picked.length);
}

const sizes = [20, 40, 60];

export default function MockExam() {
  const [exam, setExam] = useState(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

  const start = size => { setExam(buildExam(size)); setIndex(0); setResults({}); };

  if (!exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-16 sm:px-6 lg:pt-8">
        <h1 className="text-3xl font-bold text-slate-900">📝 Practice exam</h1>
        <p className="mt-2 text-lg leading-8 text-slate-600">Questions are drawn across all modules in proportion to each domain's official weight, and you'll see the explanation after each answer.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {sizes.map(size => (
            <button key={size} type="button" onClick={() => start(size)} className="rounded-xl border-2 border-slate-200 bg-white p-5 text-center hover:border-azure-500 focus:outline-none focus:ring-2 focus:ring-azure-500">
              <div className="text-3xl font-bold text-azure-600">{size}</div>
              <div className="text-sm text-slate-600">questions</div>
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-slate-500">These are original practice questions, not real exam questions. The percentage here isn't Microsoft's scaled score, and the real exam has its own format. For Microsoft's own version, use the free <a className="text-azure-600 underline" href="http://aka.ms/AI103-PA" target="_blank" rel="noreferrer">practice assessment</a>.</p>
      </div>
    );
  }

  const answered = Object.keys(results).length;
  const finished = index >= exam.length;

  if (finished) {
    const score = Object.values(results).filter(Boolean).length;
    const percent = Math.round((score / exam.length) * 100);
    const byDomain = domains.map(d => {
      const items = exam.map((q, i) => ({ q, ok: results[i] })).filter(x => x.q.domainId === d.id);
      const right = items.filter(x => x.ok).length;
      return { d, total: items.length, right, pct: items.length ? Math.round((right / items.length) * 100) : 0 };
    });
    const missedModules = [...new Set(exam.filter((_, i) => !results[i]).map(q => q.moduleId))];
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-16 sm:px-6 lg:pt-8">
        <h1 className="text-3xl font-bold text-slate-900">Your result: {percent}%</h1>
        <p className="mt-1 text-slate-600">{score} of {exam.length} correct. This isn't Microsoft's scaled score.</p>
        <h2 className="mt-6 text-xl font-bold text-slate-900">By domain</h2>
        <div className="mt-3 space-y-3">
          {byDomain.map(({ d, total, right, pct }) => (
            <div key={d.id}>
              <div className="flex justify-between text-sm"><span className="font-medium text-slate-800">{d.short}</span><span className="text-slate-600">{right} of {total}</span></div>
              <div className="mt-1 h-3 rounded bg-slate-200"><div className={`h-3 rounded ${d.bar}`} style={{ width: `${pct}%` }} /></div>
            </div>
          ))}
        </div>
        {missedModules.length > 0 && (
          <>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Review these modules</h2>
            <ul className="mt-2 space-y-1">
              {missedModules.map(id => <li key={id}><Link className="text-azure-600 underline" to={pathFor(id)}>{moduleById[id].title}</Link></li>)}
            </ul>
          </>
        )}
        <button type="button" onClick={() => setExam(null)} className="mt-6 rounded-lg bg-azure-500 px-4 py-2 font-semibold text-white hover:bg-azure-600">Start another</button>
      </div>
    );
  }

  const current = exam[index];
  const domain = domainById[current.domainId];
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-16 sm:px-6 lg:pt-8">
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>Question {index + 1} of {exam.length}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${domain.badge}`}>{domain.short}</span>
      </div>
      <div className="mb-4 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-azure-500" style={{ width: `${(answered / exam.length) * 100}%` }} /></div>
      <Question key={index} q={current} onAnswered={ok => setResults(r => ({ ...r, [index]: ok }))} />
      <div className="flex justify-between">
        <button type="button" onClick={() => setExam(null)} className="text-sm text-slate-500 underline">End and start over</button>
        <button type="button" disabled={results[index] === undefined} onClick={() => setIndex(i => i + 1)} className="rounded-lg bg-azure-500 px-4 py-2 font-semibold text-white hover:bg-azure-600 disabled:cursor-not-allowed disabled:bg-slate-300">
          {index === exam.length - 1 ? 'See results' : 'Next'}
        </button>
      </div>
    </div>
  );
}
