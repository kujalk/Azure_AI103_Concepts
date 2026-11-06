import { useMemo, useState } from 'react';
import { saveScore } from './progress';

const shuffled = list => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const isMulti = q => Array.isArray(q.answer);
const correctSet = q => (isMulti(q) ? q.answer : [q.answer]);

// Options are shuffled once per mount so you learn the answer, not its position.
export function Question({ q, number, onAnswered }) {
  const order = useMemo(() => shuffled(q.options.map((_, i) => i)), [q]);
  const [picked, setPicked] = useState([]);
  const [done, setDone] = useState(false);
  const multi = isMulti(q);
  const right = correctSet(q);

  const finish = selection => {
    const ok = selection.length === right.length && selection.every(i => right.includes(i));
    setDone(true);
    if (onAnswered) onAnswered(ok);
  };
  const click = i => {
    if (done) return;
    if (multi) {
      setPicked(p => (p.includes(i) ? p.filter(x => x !== i) : [...p, i]));
    } else {
      setPicked([i]);
      finish([i]);
    }
  };
  const ok = done && picked.length === right.length && picked.every(i => right.includes(i));

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 [overflow-wrap:anywhere]" data-testid="question">
      <p className="mb-3 font-medium leading-7 text-slate-900">{number ? `${number}. ` : ''}{q.q}</p>
      {multi && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Choose {right.length}</p>}
      <div className="space-y-2">
        {order.map(i => {
          const isRight = right.includes(i);
          const chosen = picked.includes(i);
          let tone = 'border-slate-200 bg-slate-50 hover:border-azure-500';
          if (done && isRight) tone = 'border-emerald-500 bg-emerald-50';
          else if (done && chosen) tone = 'border-rose-500 bg-rose-50';
          else if (chosen) tone = 'border-azure-500 bg-azure-50';
          return (
            <button key={i} type="button" disabled={done} aria-pressed={chosen} onClick={() => click(i)}
              className={`block w-full rounded-lg border-2 px-3 py-2 text-left text-sm leading-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-azure-500 ${tone}`}>
              {done && isRight && <span aria-label="correct answer" className="mr-1.5 font-bold text-emerald-700">✓</span>}
              {done && chosen && !isRight && <span aria-label="your incorrect answer" className="mr-1.5 font-bold text-rose-700">✗</span>}
              {q.options[i]}
            </button>
          );
        })}
      </div>
      {multi && !done && (
        <button type="button" disabled={picked.length !== right.length} onClick={() => finish(picked)}
          className="mt-3 rounded-lg bg-azure-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-azure-600 disabled:cursor-not-allowed disabled:bg-slate-300">
          Check answer
        </button>
      )}
      {done && (
        <div className="mt-3 text-sm leading-6">
          <span className={`font-bold ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{ok ? 'Correct. ' : 'Not quite. '}</span>
          <span className="text-slate-700">{q.why}</span>
        </div>
      )}
    </div>
  );
}

export default function Quiz({ id, questions }) {
  const [round, setRound] = useState(0);
  const [results, setResults] = useState({});
  const answered = Object.keys(results).length;
  const score = Object.values(results).filter(Boolean).length;
  const finished = answered === questions.length;

  const record = (i, ok) => {
    setResults(prev => {
      const next = { ...prev, [i]: ok };
      if (Object.keys(next).length === questions.length) {
        saveScore(id, Math.round((Object.values(next).filter(Boolean).length / questions.length) * 100));
      }
      return next;
    });
  };

  return (
    <div key={round}>
      <p className="mb-4 text-sm text-slate-600">{questions.length} scenario questions. Your best score is saved in this browser only.</p>
      {questions.map((q, i) => <Question key={`${round}-${i}`} q={q} number={i + 1} onAnswered={ok => record(i, ok)} />)}
      <div className="sticky bottom-3 flex items-center justify-between rounded-lg bg-azure-900 px-4 py-2.5 text-sm text-white shadow-lg">
        <span aria-live="polite">{finished ? `Finished: ${score} of ${questions.length} correct` : `${answered} of ${questions.length} answered, ${score} correct`}</span>
        {finished && <button type="button" onClick={() => { setResults({}); setRound(r => r + 1); }} className="rounded bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">Try again</button>}
      </div>
    </div>
  );
}
