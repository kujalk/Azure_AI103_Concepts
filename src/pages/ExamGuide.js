import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import domains from '../data/domains';
import skills from '../data/skills';
import { moduleById, pathFor } from '../data/modules';
import { getChecked, saveChecked } from '../components/progress';
import { Callout, Table } from '../components/ui';

export default function ExamGuide() {
  const [checked, setChecked] = useState({});
  useEffect(() => { setChecked(getChecked()); }, []);
  const toggle = key => setChecked(prev => {
    const next = { ...prev, [key]: !prev[key] };
    saveChecked(next);
    return next;
  });
  const all = skills.flatMap(g => g.items);
  const done = all.filter(([text]) => checked[text]).length;
  const percent = Math.round((done / all.length) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 sm:px-6 lg:pt-8">
      <h1 className="text-3xl font-bold text-slate-900">🗺️ Exam map & checklist</h1>
      <p className="mt-2 text-lg leading-8 text-slate-600">Every skill from Microsoft's study guide, linked to where this site teaches it. Tick each one when you could explain it to someone else.</p>

      <h2 className="mt-6 text-xl font-bold text-slate-900">Where the marks are</h2>
      <div className="mt-3 space-y-2">
        {domains.map(d => (
          <div key={d.id}>
            <div className="flex justify-between text-sm"><span className="font-medium text-slate-800">{d.name}</span><span className="text-slate-600">{d.weight}</span></div>
            <div className="mt-1 h-3 rounded bg-slate-200" role="img" aria-label={`${d.name}: ${d.weight} of the exam`}>
              <div className={`h-3 rounded ${d.bar}`} style={{ width: `${(d.high / 35) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Callout kind="exam">
        The first two domains make up 55 to 65% of the exam. If you're short on time, put <Link className="underline" to="/agent-types">agents</Link>, <Link className="underline" to="/model-selection">model choice</Link>, <Link className="underline" to="/telemetry">telemetry</Link> and <Link className="underline" to="/security">security</Link> first.
      </Callout>

      <h2 className="mt-8 text-xl font-bold text-slate-900">What's different about this exam</h2>
      <Table head={['Remember', 'Why']} rows={[
        ['It\'s Foundry-first', 'The audience profile centres on agents and AI solutions built with Microsoft Foundry'],
        ['Names changed recently', 'Old material says Azure AI Studio, Assistants API, threads and hubs. See the Foundry Platform page'],
        ['Most questions cover GA features', 'But preview features can appear if they\'re commonly used, so know what\'s in preview'],
        ['"Related topics may be covered"', 'The skills list illustrates what\'s assessed. It isn\'t a complete list'],
      ]} />
      <Callout kind="note">
        Before you book, check the current exam length and format on your Microsoft scheduling page, because the official page used for this site doesn't state them. Microsoft also offers a free practice assessment and an exam sandbox, both linked from the <a className="underline" href="https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-103" target="_blank" rel="noreferrer">study guide</a>.
      </Callout>

      <div className="sticky top-0 z-10 mt-8 rounded-lg bg-azure-900 px-4 py-2.5 text-sm text-white shadow lg:top-2">
        <div className="flex justify-between"><span>Your progress</span><span aria-live="polite">{done} of {all.length} skills ({percent}%)</span></div>
        <div className="mt-1.5 h-1.5 rounded bg-white/20"><div className="h-1.5 rounded bg-white" style={{ width: `${percent}%` }} /></div>
      </div>

      {domains.map(d => (
        <section key={d.id} className="mt-8" aria-labelledby={`skills-${d.id}`}>
          <h2 id={`skills-${d.id}`} className="text-xl font-bold text-slate-900">
            {d.name} <span className={`ml-1 rounded-full px-2 py-0.5 align-middle text-xs font-semibold ${d.badge}`}>{d.weight}</span>
          </h2>
          {skills.filter(g => g.domain === d.id).map(g => (
            <div key={g.group} className="mt-4">
              <h3 className="font-semibold text-slate-800">{g.group}</h3>
              <ul className="mt-2 space-y-1">
                {g.items.map(([text, moduleId]) => (
                  <li key={text} className="flex items-start gap-2.5 rounded-md bg-white p-2.5 text-sm leading-6 shadow-sm">
                    <input id={text} type="checkbox" checked={!!checked[text]} onChange={() => toggle(text)} className="mt-1 h-4 w-4 shrink-0 accent-azure-500" />
                    <div className="min-w-0 flex-grow">
                      <label htmlFor={text} className={checked[text] ? 'text-slate-500 line-through' : 'text-slate-800'}>{text}</label>
                      <div><Link to={pathFor(moduleId)} className="text-xs font-semibold text-azure-600 hover:underline">{moduleById[moduleId].title} →</Link></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
