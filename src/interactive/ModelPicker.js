import { useState } from 'react';
import { Choice, Panel, C } from '../components/ui';

const tasks = [
  { value: 'agent', label: 'Agent that calls tools' },
  { value: 'text', label: 'Text generation or extraction' },
  { value: 'vision', label: 'Reason over images' },
  { value: 'code', label: 'Code generation' },
  { value: 'embed', label: 'Embeddings for vector search' },
  { value: 'media', label: 'Create images or video' },
  { value: 'prebuilt', label: 'PII, translation, speech, OCR' },
];

const complexityAdvice = {
  simple: { family: 'Small language model', why: 'Short, well-defined prompts rarely need frontier reasoning, so a smaller model usually gives lower cost and latency.', examples: ['gpt-5-mini', 'gpt-5-nano', 'Mistral-small-2503'] },
  mixed: { family: 'Model router', why: 'When prompt difficulty varies, the router picks a model per request. Start in Balanced mode and compare it against a single-model baseline.', examples: ['model router deployment', 'with a model subset you have approved'] },
  hard: { family: 'Frontier or reasoning LLM', why: 'Multi-step reasoning and sophisticated tool orchestration are where a higher-cost model can justify itself.', examples: ['gpt-5.5', 'o-series', 'MAI-Thinking-1'] },
};

const deployment = {
  none: { bursty: 'Global Standard', steady: 'Global Provisioned', batch: 'Global Batch' },
  zone: { bursty: 'Data Zone Standard', steady: 'Data Zone Provisioned', batch: 'Data Zone Batch' },
  geo: { bursty: 'Standard', steady: 'Regional Provisioned', batch: null },
};

function recommend(task, complexity) {
  switch (task) {
    case 'agent': {
      const a = complexityAdvice[complexity];
      return { ...a, check: 'The model must support tool calling and Agent Service. Phi-4-mini-instruct and Codestral-2501, for example, are listed with tool calling: No.' };
    }
    case 'text': {
      const a = complexityAdvice[complexity];
      return { ...a, check: 'If the output feeds other code, confirm the model supports JSON response formats or structured outputs.' };
    }
    case 'vision':
      return { family: 'Multimodal model', why: 'Vision-enabled models take images alongside text, so they can answer questions about what an image shows.', examples: ['gpt-4o', 'Mistral-Large-3', 'Phi-4-multimodal-instruct (also accepts audio)'], check: 'Filter the catalog on input type. If you need fixed fields rather than free reasoning, compare with Content Understanding.' };
    case 'code':
      return { family: 'Code model', why: 'Code-specialised models are tuned for code generation and completion.', examples: ['codex-mini', 'Codestral-2501', 'Kimi-K2.7-Code'], check: 'Check tool calling if a coding agent needs it: Codestral-2501 has none, Kimi-K2.7-Code does.' };
    case 'embed':
      return { family: 'Embedding model', why: 'Embeddings convert text to vectors for similarity search. A chat model cannot do this job.', examples: ['Embeddings models in the Azure OpenAI collection'], check: 'Use the same embedding model at indexing and query time. Vectors from different models are not comparable.' };
    case 'media':
      return { family: 'Image or video generation model', why: 'Generation needs a dedicated model. A chat model describes pictures but does not produce them.', examples: ['gpt-image-2', 'gpt-image-1-mini', 'sora-2'], check: 'gpt-image-1-mini has no input fidelity or dedicated face preservation, and Sora 2 is in preview.' };
    default:
      return { family: 'Foundry Tools first', why: 'A prebuilt service can be simpler and more predictable than prompting an LLM for a well-defined task.', examples: ['Azure Language (PII, NER)', 'Azure Translator', 'Azure Speech', 'Content Understanding'], check: 'Choose an LLM instead when you need free-form reasoning, tone or custom output that the prebuilt service cannot give.' };
  }
}

export default function ModelPicker() {
  const [task, setTask] = useState('agent');
  const [complexity, setComplexity] = useState('mixed');
  const [residency, setResidency] = useState('none');
  const [traffic, setTraffic] = useState('bursty');
  const r = recommend(task, complexity);
  const usesComplexity = task === 'agent' || task === 'text';
  const usesDeployment = task !== 'prebuilt';
  const dep = deployment[residency][traffic];

  return (
    <Panel title="Model picker">
      <Choice label="1. What is the job?" options={tasks} value={task} onChange={setTask} />
      {usesComplexity && (
        <Choice label="2. How hard are the prompts?" value={complexity} onChange={setComplexity} options={[
          { value: 'simple', label: 'Mostly simple' },
          { value: 'mixed', label: 'A mix of simple and hard' },
          { value: 'hard', label: 'Mostly complex reasoning' },
        ]} />
      )}
      {usesDeployment && (
        <>
          <Choice label={`${usesComplexity ? 3 : 2}. Where may data be processed?`} value={residency} onChange={setResidency} options={[
            { value: 'none', label: 'No restriction' },
            { value: 'zone', label: 'Inside a data zone (EU, US, APAC)' },
            { value: 'geo', label: 'Inside one Azure geography' },
          ]} />
          <Choice label={`${usesComplexity ? 4 : 3}. What does the traffic look like?`} value={traffic} onChange={setTraffic} options={[
            { value: 'bursty', label: 'Variable or bursty' },
            { value: 'steady', label: 'High and consistent, low latency variance' },
            { value: 'batch', label: 'Large async jobs' },
          ]} />
        </>
      )}
      <div className="mt-2 rounded-lg bg-azure-50 p-4" aria-live="polite">
        <div className="text-xs font-bold uppercase tracking-wide text-azure-700">Recommendation</div>
        <div className="mt-1 text-lg font-bold text-slate-900">{r.family}</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{r.why}</p>
        <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">Examples: </span>{r.examples.join(', ')}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-semibold">Check before you commit: </span>{r.check}</p>
        {usesDeployment && (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            <span className="font-semibold">Deployment type: </span>
            {dep ? <C>{dep}</C> : 'Batch has no single-geography option. Use Data Zone Batch if a data zone is acceptable, or process online with Standard.'}
          </p>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Study aid only. Model names are examples from Microsoft's catalog pages in November 2026. Availability varies by region and deployment type.</p>
    </Panel>
  );
}
