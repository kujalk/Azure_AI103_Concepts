import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, Flow, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Tuning = () => (
  <>
    <H2>Prompt engineering techniques</H2>
    <Table head={['Technique', 'What it means', 'Helps when']} rows={[
      ['Clear instructions', 'State the role, task, limits and output format', 'Output is inconsistent'],
      ['Few-shot examples', 'Show sample inputs and the outputs you want', 'The format or judgment is hard to describe'],
      ['Delimiters', 'Separate instructions from data with clear markers', 'User or document text gets mistaken for instructions'],
      ['Step-by-step reasoning', 'Ask the model to work through the problem first', 'Multi-step logic goes wrong'],
      ['Permission to abstain', 'Tell it to say "I don\'t know" when the context lacks the answer', 'It fabricates answers'],
    ]} />
    <H2>Model parameters</H2>
    <Table head={['Parameter', 'Effect', 'Guidance']} rows={[
      ['Temperature', 'Controls randomness', 'Low for extraction and classification, higher for creative writing'],
      ['Top_p', 'Limits sampling to the most likely tokens', 'Tune this or temperature rather than both'],
      ['Max output tokens', 'Caps response length', 'Keep it near what you need. Input, output and reasoning tokens share one context budget'],
      ['Reasoning effort', 'How much a reasoning model thinks', 'Higher costs more tokens and time. Check what your model accepts'],
    ]} />
    <Callout kind="note">
      Supported parameters vary by model. Reasoning models in particular may not accept some settings, so check the model's reference before relying on one.
    </Callout>
    <H2>Structured outputs</H2>
    <P>Structured outputs make the model follow a JSON Schema. The older JSON mode only guaranteed valid JSON, not that it matched your schema. In the Responses API, the schema goes under <C>text.format</C>. In Chat Completions, it goes in <C>response_format</C>.</P>
    <Code title="Python: parse into a Pydantic model" code={`
from pydantic import BaseModel

class SupportTicket(BaseModel):
    category: str
    urgent: bool
    summary: str

response = openai.responses.parse(
    model="gpt-5-mini",
    input="My boots arrived damaged and I need them by Friday!",
    text_format=SupportTicket,
)
print(response.output_parsed.category)
`} />
    <Callout kind="trap">
      Structured outputs aren't supported with parallel function calls. Set <C>parallel_tool_calls</C> to false when you use them together.
    </Callout>
  </>
);

const Reflection = () => (
  <>
    <H2>Reflection and self-critique</H2>
    <P>Instead of trusting the first answer, ask a model to check it against criteria, then revise. It costs extra calls, so save it for work where quality matters more than latency.</P>
    <Flow steps={[
      { title: 'Generate', sub: 'Draft an answer' },
      { title: 'Critique', sub: 'Check against criteria' },
      { title: 'Pass?', sub: 'If yes, stop' },
      { title: 'Revise', sub: 'Fix, with a round limit' },
    ]} />
    <Code title="Python: a self-critique loop with a stopping rule" code={`
from pydantic import BaseModel

class Critique(BaseModel):
    passes: bool
    problems: list[str]

draft = openai.responses.create(model=WRITER, input=f"Answer using only this policy:\\n{policy}\\n\\nQ: {question}").output_text

for _ in range(2):   # always cap the rounds: each one costs tokens and time
    review = openai.responses.parse(
        model=CRITIC,
        input=f"Policy:\\n{policy}\\n\\nAnswer:\\n{draft}\\n\\nIs every claim supported by the policy?",
        text_format=Critique,
    ).output_parsed
    if review.passes:
        break
    draft = openai.responses.create(
        model=WRITER,
        input=f"Fix these problems: {review.problems}\\n\\nPolicy:\\n{policy}\\n\\nAnswer:\\n{draft}",
    ).output_text
`} />
    <H3>Design points</H3>
    <UL>
      <li><strong>Always set a round limit</strong>, otherwise a critic that never approves means runaway cost.</li>
      <li><strong>Make the critic's output structured</strong>, so your code can act on the verdict.</li>
      <li><strong>A different critic model</strong> can spot errors the writer repeats.</li>
    </UL>
    <H2>Chain-of-thought evaluation</H2>
    <P>Chain-of-thought asks a model to reason in steps. To <em>evaluate</em> that reasoning, you score the path as well as the final answer.</P>
    <UL>
      <li><strong>Rubric evaluators</strong> score against weighted criteria, with reasoning per dimension.</li>
      <li><strong>Task Navigation Efficiency</strong> compares an agent's steps to an expected path.</li>
      <li><strong>Evaluator explanations</strong> show why a score was given, where supported.</li>
    </UL>
  </>
);

const Hybrid = () => (
  <>
    <H2>Orchestrating models and rules</H2>
    <P>Not everything should go to an LLM. Fixed rules are cheaper, deterministic and easy to audit, and models handle ambiguity. Good systems use each where it fits.</P>
    <Table head={['Pattern', 'How it works', 'Example']} rows={[
      ['Rules first', 'Check rules, and call a model only for what\'s left', 'Reject returns after 30 days in code, and use a model for the exceptions'],
      ['Rules as a safety net', 'A model decides, then rules validate before acting', 'Refuse any refund above a set amount, whatever the model says'],
      ['Tiered models', 'A cheap model handles most, escalating when unsure', 'Small model first, and a frontier model for hard cases'],
      ['Managed routing', 'Model router picks per request', 'A single endpoint for mixed traffic'],
      ['Specialist per step', 'Different models in a pipeline', 'OCR model, then extraction, then a reasoning model'],
      ['Scoring model', 'A model returns calibrated probabilities that your rules threshold', 'Microsoft-Decision-1 scoring options for a business rule'],
    ]} />
    <Callout kind="exam">
      Anything that must be <strong>guaranteed</strong>, such as a spending limit, belongs in deterministic code rather than instructions. A prompt can be ignored or overridden. A rule in your app can't.
    </Callout>
    <H2>A cost and quality ladder</H2>
    <OL>
      <li>Can a rule or lookup answer it? Then don't call a model.</li>
      <li>Can a prebuilt Foundry Tool do it? PII detection or translation often can.</li>
      <li>Can a small model do it? Check with your evaluation set.</li>
      <li>Is difficulty mixed? Try model router.</li>
      <li>Only then default to a frontier model.</li>
    </OL>
    <H3>Keep it observable</H3>
    <UL>
      <li>Log which branch and model handled each request.</li>
      <li>Add custom spans around your rules so the trace shows the whole decision.</li>
      <li>Evaluate the complete pipeline, since each part can pass while the whole fails.</li>
    </UL>
  </>
);

export default function Optimization() {
  return (
    <ModulePage id="optimization"
      intro="Get better output for less: tune prompts and parameters, add self-checking loops, and combine models with plain rules."
      tabs={[
        { id: 'tuning', label: 'Prompts & parameters', content: <Tuning /> },
        { id: 'reflection', label: 'Reflection', content: <Reflection /> },
        { id: 'hybrid', label: 'Models + rules', content: <Hybrid /> },
      ]}
      sources={[
        ['Prompt engineering techniques', 'https://learn.microsoft.com/azure/foundry/openai/concepts/prompt-engineering'],
        ['Structured outputs', 'https://learn.microsoft.com/azure/foundry/openai/how-to/structured-outputs'],
        ['Reasoning models', 'https://learn.microsoft.com/azure/foundry/openai/how-to/reasoning'],
        ['Rubric evaluators', 'https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rubric-evaluators'],
        ['Built-in evaluators reference', 'https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators'],
        ['Prompt optimizer', 'https://learn.microsoft.com/azure/foundry/observability/how-to/prompt-optimizer'],
        ['Foundry Models sold by Azure (Microsoft-Decision-1)', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure'],
      ]} />
  );
}
