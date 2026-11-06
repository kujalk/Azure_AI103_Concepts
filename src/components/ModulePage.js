import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import modules, { moduleById, pathFor } from '../data/modules';
import { domainById } from '../data/domains';
import skills from '../data/skills';
import questions from '../data/questions';
import Quiz from './Quiz';
import { Sources } from './ui';

export default function ModulePage({ id, intro, tabs, sources }) {
  const mod = moduleById[id];
  const domain = domainById[mod.domain];
  const allTabs = useMemo(() => [
    ...tabs,
    { id: 'quiz', label: 'Quiz', content: <Quiz id={id} questions={questions[id]} /> },
    { id: 'sources', label: 'Sources', content: <Sources links={sources} /> },
  ], [id, tabs, sources]);
  const [active, setActive] = useState(allTabs[0].id);
  useEffect(() => { window.scrollTo?.(0, 0); }, [id]);

  const covered = skills.flatMap(g => g.items).filter(([, m]) => m === id).map(([text]) => text);
  const index = modules.findIndex(m => m.id === id);
  const next = modules[index + 1];
  const current = allTabs.find(t => t.id === active);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16 pt-16 sm:px-6 lg:pt-8">
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${domain.badge}`}>{domain.short} · {domain.weight} of exam</span>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{mod.icon} {mod.title}</h1>
      <p className="mt-2 text-lg leading-8 text-slate-600">{intro}</p>
      {covered.length > 0 && (
        <details className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Exam skills this page covers ({covered.length})</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">{covered.map(c => <li key={c}>{c}</li>)}</ul>
        </details>
      )}

      <div role="tablist" aria-label={`${mod.title} sections`} className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
        {allTabs.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)}
            className={`-mb-px rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-azure-500 ${active === t.id ? 'border-azure-500 bg-white text-azure-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-6">{current.content}</div>

      {next && (
        <div className="mt-10 border-t border-slate-200 pt-4 text-right text-sm">
          <Link className="font-semibold text-azure-600 hover:underline" to={pathFor(next.id)}>Next: {next.title} →</Link>
        </div>
      )}
    </article>
  );
}
