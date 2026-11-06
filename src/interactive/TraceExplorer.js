import { useState } from 'react';
import { Panel, Choice, C } from '../components/ui';

// An illustrative trace for teaching. Durations and token counts are made up; attribute names follow the OpenTelemetry GenAI conventions.
const spans = fail => [
  { id: 'root', name: 'invoke_agent contoso-support', depth: 0, start: 0, ms: fail ? 2240 : 3420, kind: 'agent', status: fail ? 'ERROR' : 'OK',
    plain: 'The whole agent run. Every other span is nested inside it, and they all share one trace ID.',
    attrs: { 'gen_ai.operation.name': 'invoke_agent', 'gen_ai.agent.name': 'contoso-support', 'gen_ai.agent.id': 'contoso-support:3', 'gen_ai.conversation.id': 'conv_8f21', ...(fail ? { 'error.type': 'ToolExecutionError' } : {}) } },
  { id: 'chat1', name: 'chat gpt-5-mini', depth: 1, start: 40, ms: 640, kind: 'model', status: 'OK', input: 412, output: 38,
    plain: 'First model call. The model reads the question and decides to call the order lookup tool.',
    attrs: { 'gen_ai.operation.name': 'chat', 'gen_ai.request.model': 'gpt-5-mini', 'gen_ai.usage.input_tokens': 412, 'gen_ai.usage.output_tokens': 38 } },
  { id: 'tool', name: 'execute_tool lookup_order', depth: 1, start: 690, ms: fail ? 1500 : 1180, kind: 'tool', status: fail ? 'ERROR' : 'OK',
    plain: fail ? 'The order API timed out, so the run failed here. The model did nothing wrong, which is why you read the spans before changing the prompt.' : 'Your function ran. Arguments and result appear only if content recording is on, because they can hold personal data.',
    attrs: { 'gen_ai.operation.name': 'execute_tool', 'gen_ai.tool.name': 'lookup_order', 'gen_ai.tool.call.arguments': '{"order_id":"A1042"} (content recording only)', ...(fail ? { 'error.type': 'TimeoutError' } : { 'gen_ai.tool.call.result': '{"status":"shipped"} (content recording only)' }) } },
  ...(fail ? [] : [{ id: 'chat2', name: 'chat gpt-5-mini', depth: 1, start: 1880, ms: 1490, kind: 'model', status: 'OK', input: 468, output: 72,
    plain: 'Second model call. The model turns the tool result into the final answer. Token counts grow because the tool output is now part of the input.',
    attrs: { 'gen_ai.operation.name': 'chat', 'gen_ai.request.model': 'gpt-5-mini', 'gen_ai.usage.input_tokens': 468, 'gen_ai.usage.output_tokens': 72 } }]),
];

const bar = { agent: 'bg-violet-500', model: 'bg-blue-500', tool: 'bg-amber-500' };

export default function TraceExplorer() {
  const [mode, setMode] = useState('ok');
  const [selected, setSelected] = useState('root');
  const fail = mode === 'fail';
  const list = spans(fail);
  const total = list[0].ms;
  const span = list.find(s => s.id === selected) || list[0];
  const inputTokens = list.reduce((n, s) => n + (s.input || 0), 0);
  const outputTokens = list.reduce((n, s) => n + (s.output || 0), 0);
  const modelMs = list.filter(s => s.kind === 'model').reduce((n, s) => n + s.ms, 0);
  const toolMs = list.filter(s => s.kind === 'tool').reduce((n, s) => n + s.ms, 0);

  return (
    <Panel title="Trace explorer">
      <p className="mb-3 text-sm leading-6 text-slate-600">A customer asks "Where is order A1042?". Select a span to see what it records.</p>
      <Choice label="Which run?" value={mode} onChange={m => { setMode(m); setSelected(m === 'fail' ? 'tool' : 'root'); }} options={[
        { value: 'ok', label: 'Successful run' },
        { value: 'fail', label: 'Failing run' },
      ]} />
      <div className="space-y-1.5" role="list" aria-label="Spans in this trace">
        {list.map(s => (
          <button key={s.id} type="button" onClick={() => setSelected(s.id)} aria-pressed={selected === s.id}
            className={`block w-full rounded-md border p-2 text-left focus:outline-none focus:ring-2 focus:ring-azure-500 ${selected === s.id ? 'border-azure-500 bg-azure-50' : 'border-slate-200 bg-white hover:border-azure-500'}`}>
            <div className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
              <span className="font-mono text-slate-900" style={{ paddingLeft: s.depth * 16 }}>{s.name}</span>
              <span className={`shrink-0 ${s.status === 'ERROR' ? 'font-bold text-rose-700' : 'text-slate-500'}`}>{s.status === 'ERROR' ? 'ERROR · ' : ''}{s.ms.toLocaleString()} ms</span>
            </div>
            <div className="mt-1 h-2 rounded bg-slate-100">
              <div className={`h-2 rounded ${s.status === 'ERROR' ? 'bg-rose-500' : bar[s.kind]}`} style={{ marginLeft: `${(s.start / total) * 100}%`, width: `${Math.max((s.ms / total) * 100, 1)}%` }} />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">What this span tells you</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{span.plain}</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Attributes</div>
          <dl className="mt-1 space-y-1 text-xs">
            {Object.entries(span.attrs).map(([k, v]) => (
              <div key={k} className="break-words"><dt className="inline font-mono text-azure-700">{k}: </dt><dd className="inline text-slate-700">{String(v)}</dd></div>
            ))}
          </dl>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Total time', `${total.toLocaleString()} ms`], ['In model calls', `${modelMs.toLocaleString()} ms`], ['In tools', `${toolMs.toLocaleString()} ms`], ['Tokens in / out', `${inputTokens} / ${outputTokens}`]].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-100 p-2.5">
            <div className="text-xs text-slate-600">{label}</div>
            <div className="text-sm font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Illustrative data: the durations and token counts are made up. Attribute names follow the <C>gen_ai.*</C> conventions, which OpenTelemetry still marks as Development status, so they can change.</p>
    </Panel>
  );
}
