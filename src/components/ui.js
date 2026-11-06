import { useState } from 'react';

export const C = ({ children }) => (
  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] text-slate-800 break-words">{children}</code>
);

export const H2 = ({ children }) => <h2 className="mt-8 mb-3 text-xl font-bold text-slate-900 first:mt-0">{children}</h2>;
export const H3 = ({ children }) => <h3 className="mt-5 mb-2 text-base font-semibold text-slate-900">{children}</h3>;
export const P = ({ children }) => <p className="mb-3 leading-7 text-slate-700">{children}</p>;
export const UL = ({ children }) => <ul className="mb-4 list-disc space-y-1.5 pl-5 leading-7 text-slate-700">{children}</ul>;
export const OL = ({ children }) => <ol className="mb-4 list-decimal space-y-1.5 pl-5 leading-7 text-slate-700">{children}</ol>;

const calloutStyles = {
  exam: { label: 'Exam focus', box: 'border-azure-500 bg-azure-50', title: 'text-azure-700' },
  trap: { label: 'Common trap', box: 'border-rose-500 bg-rose-50', title: 'text-rose-700' },
  note: { label: 'Note', box: 'border-slate-400 bg-slate-100', title: 'text-slate-700' },
  preview: { label: 'Preview feature', box: 'border-amber-500 bg-amber-50', title: 'text-amber-800' },
};
export const Callout = ({ kind = 'note', title, children }) => {
  const s = calloutStyles[kind];
  return (
    <div className={`my-4 rounded-r-lg border-l-4 p-4 ${s.box}`}>
      <div className={`mb-1 text-xs font-bold uppercase tracking-wide ${s.title}`}>{title || s.label}</div>
      <div className="leading-7 text-slate-800">{children}</div>
    </div>
  );
};

export const Table = ({ head, rows }) => (
  <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-slate-700">
        <tr>{head.map(h => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-200 align-top">
            {r.map((cell, j) => <td key={j} className={`px-3 py-2 leading-6 ${j === 0 ? 'font-medium text-slate-900' : 'text-slate-700'}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Code = ({ title, code }) => {
  const [copied, setCopied] = useState(false);
  const text = code.replace(/^\n/, '').trimEnd();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="my-4 overflow-hidden rounded-lg bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-1.5 text-xs text-slate-300">
        <span>{title || 'Code'}</span>
        <button type="button" onClick={copy} className="rounded px-2 py-0.5 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-slate-100"><code>{text}</code></pre>
    </div>
  );
};

export const Grid = ({ cols = 2, children }) => (
  <div className={`my-4 grid gap-3 ${cols === 3 ? 'md:grid-cols-3' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>{children}</div>
);

export const Card = ({ title, children, tone = 'bg-white' }) => (
  <div className={`rounded-lg border border-slate-200 p-4 ${tone}`}>
    {title && <div className="mb-1.5 font-semibold text-slate-900">{title}</div>}
    <div className="text-sm leading-6 text-slate-700">{children}</div>
  </div>
);

// A left-to-right pipeline that wraps on small screens.
export const Flow = ({ steps, onSelect, selected }) => (
  <div className="my-4 flex flex-wrap items-stretch gap-y-2">
    {steps.map((s, i) => {
      const active = selected === i;
      const body = (
        <>
          <div className="text-sm font-semibold text-slate-900">{s.title}</div>
          {s.sub && <div className="mt-0.5 text-xs leading-5 text-slate-600">{s.sub}</div>}
        </>
      );
      const cls = `w-36 rounded-lg border-2 p-2.5 text-left ${active ? 'border-azure-500 bg-azure-50' : 'border-slate-200 bg-white'}`;
      return (
        <div key={s.title} className="flex items-stretch">
          {onSelect
            ? <button type="button" aria-pressed={active} onClick={() => onSelect(i)} className={`${cls} hover:border-azure-500 focus:outline-none focus:ring-2 focus:ring-azure-500`}>{body}</button>
            : <div className={cls}>{body}</div>}
          {i < steps.length - 1 && <div aria-hidden="true" className="flex items-center px-1 text-slate-400">→</div>}
        </div>
      );
    })}
  </div>
);

// Pick-one button group used by the interactive tools.
export const Choice = ({ label, options, value, onChange }) => (
  <fieldset className="mb-4">
    <legend className="mb-1.5 text-sm font-semibold text-slate-900">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-full border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 ${value === o.value ? 'border-azure-500 bg-azure-500 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-azure-500'}`}>
          {o.label}
        </button>
      ))}
    </div>
  </fieldset>
);

export const Panel = ({ title, children }) => (
  <div className="my-4 rounded-xl border border-azure-100 bg-white p-5 shadow-sm">
    {title && <div className="mb-3 text-sm font-bold uppercase tracking-wide text-azure-700">{title}</div>}
    {children}
  </div>
);

export const Sources = ({ links }) => (
  <div>
    <P>Everything on this page was checked against these Microsoft sources. Foundry changes quickly, so treat the docs as the final word.</P>
    <ul className="space-y-2">
      {links.map(([label, url]) => (
        <li key={url}><a className="text-azure-600 underline hover:text-azure-700" href={url} target="_blank" rel="noreferrer">{label}</a></li>
      ))}
    </ul>
  </div>
);
