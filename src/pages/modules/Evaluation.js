import ModulePage from '../../components/ModulePage';
import { Callout, Flow, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Evaluators = () => (
  <>
    <H2>Choose evaluators by what you're building</H2>
    <Table head={['App type', 'Combine']} rows={[
      ['RAG', 'Retrieval + Groundedness + Relevance + content safety'],
      ['Agent', 'Output Quality + Tool Use Quality + Rubric + content safety'],
      ['Translation', 'BLEU + METEOR + Fluency + Coherence'],
      ['Every app', 'Add risk and safety evaluators: Hate and Unfairness, Sexual, Violence, Self-Harm'],
    ]} />
    <H2>The evaluators</H2>
    <H3>General purpose and RAG</H3>
    <Table head={['Evaluator', 'Measures']} rows={[
      ['Coherence, Fluency', 'Logical flow, and natural language quality'],
      ['Relevance', 'How well the response addresses the query'],
      ['Groundedness', 'Whether the response is grounded in retrieved context. 1 to 5, judged by a model'],
      ['Groundedness Pro (preview)', 'Same goal, but binary pass/fail through Content Safety, with no model deployment needed'],
      ['Retrieval', 'How effectively the system retrieves relevant information'],
      ['Document Retrieval', 'Retrieval accuracy against ground truth'],
      ['Response Completeness (preview)', 'Whether critical information is missing, against ground truth'],
      ['Similarity', 'Closeness to a ground-truth answer'],
    ]} />
    <H3>Agents</H3>
    <Table head={['Evaluator', 'Measures']} rows={[
      ['Intent Resolution (preview)', 'Did it identify and address what the user wanted?'],
      ['Task Adherence (preview)', 'Did it follow its instructions and constraints?'],
      ['Task Completion (preview)', 'Did it finish the task end to end?'],
      ['Task Navigation Efficiency', 'Did its steps match the optimal or expected path?'],
      ['Tool Selection', 'Did it pick the right tools?'],
      ['Tool Input Accuracy', 'Were the parameters correct?'],
      ['Tool Output Utilization', 'Did it use the tool results properly?'],
      ['Tool Call Success', 'Did calls run without technical failure?'],
      ['Tool Call Accuracy', 'Overall quality of selection, parameters and efficiency'],
      ['Customer Satisfaction (preview)', 'Predicted satisfaction across a conversation'],
    ]} />
    <H3>Risk and safety</H3>
    <Table head={['Evaluator', 'Detects']} rows={[
      ['Hate and Unfairness, Sexual, Violence, Self-Harm', 'Harmful content categories'],
      ['Protected Materials', 'Unauthorized use of copyrighted content'],
      ['Indirect Attack (XPIA)', 'Whether the response fell for an injected instruction in retrieved context'],
      ['Code Vulnerability', 'Security problems in generated code'],
      ['Ungrounded Attributes', 'Fabricated information inferred from user interactions'],
      ['Prohibited Actions', 'An agent doing what it was told not to do'],
      ['Sensitive Data Leakage', 'An agent exposing sensitive information'],
    ]} />
    <H3>Custom</H3>
    <UL>
      <li><strong>Rubric (preview):</strong> scores against your weighted criteria with an LLM as judge, from 0 to 1, with reasoning per dimension.</li>
      <li><strong>Custom evaluators:</strong> your own Python code or LLM-as-judge prompt.</li>
      <li><strong>OpenAI graders:</strong> string check, text similarity, and score or label models.</li>
      <li><strong>Human evaluation:</strong> structured human judgments and trace annotation.</li>
    </UL>
    <Callout kind="exam" title="Exam focus: fabrication">
      "Detect fabrications" means groundedness. <strong>Groundedness</strong> asks if the answer is supported by the context. <strong>Relevance</strong> asks if it addresses the question. An answer can be relevant yet invented, or grounded yet off-topic.
    </Callout>
    <H3>Reading scores</H3>
    <Table head={['Type', 'Output', 'Examples']} rows={[
      ['GPT-judge evaluators', '1 to 5, then pass or fail against a threshold', 'Groundedness, Relevance, Intent Resolution, Tool Call Accuracy'],
      ['Binary evaluators', 'Pass or fail. Aggregated as a fraction, so 0.67 means 67% passed', 'Task Adherence, Task Completion, Tool Selection, Tool Call Success'],
    ]} />
    <P>On the 1 to 5 scale, 4 to 5 is strong, 3 to 3.9 is acceptable, 2 to 2.9 is weak, and below 2 is poor. Many evaluators need a <strong>model deployment to act as the judge</strong>, and its choice affects your results.</P>
  </>
);

const Workflow = () => (
  <>
    <H2>The evaluation workflow</H2>
    <Flow steps={[
      { title: 'Choose data', sub: 'Dataset, traces or generated responses' },
      { title: 'Select evaluators', sub: 'Quality and safety' },
      { title: 'Run', sub: 'Once, in CI/CD, or recurring' },
      { title: 'Review', sub: 'Compare, cluster failures' },
      { title: 'Improve', sub: 'Then re-evaluate' },
    ]} />
    <H2>What to evaluate</H2>
    <Table head={['Data source', 'Use it for']} rows={[
      ['JSONL dataset with responses', 'Scoring outputs you already have'],
      ['Dataset with inputs only', 'Foundry generates fresh responses from the model or agent, ignoring any stored ones'],
      ['Synthetic data', 'When you don\'t have labelled examples yet'],
      ['Production traces', 'Real behaviour, without a prepared dataset'],
      ['Simulated conversations', 'Multi-turn behaviour before launch'],
    ]} />
    <P>Use <strong>turn-level</strong> scoring for one response in context, and <strong>conversation-level</strong> scoring for the whole interaction. Agent and safety evaluators in the portal work on individual turns.</P>
    <H2>When to run it</H2>
    <Table head={['Stage', 'Type', 'What it answers']} rows={[
      ['Development', 'Manual run in the portal or SDK', 'Which version is better?'],
      ['Release', 'CI/CD gate in GitHub Actions or Azure DevOps', 'Did this change cause a regression?'],
      ['Production', 'Scheduled evaluation on a golden dataset', 'Has quality drifted over time?'],
      ['Production', 'Continuous evaluation sampling live traffic', 'How is it doing right now?'],
      ['Ongoing', 'Red team scans', 'Can it be attacked?'],
    ]} />
    <Callout kind="exam">
      Set up recurring runs under <strong>Build &gt; Evaluations &gt; Recurring Configs</strong>. <strong>Scheduled</strong> runs on a fixed timetable. <strong>Continuous</strong> samples live traffic, either randomly or with intelligent sampling, up to a maximum you set.
    </Callout>
    <H2>Error analysis loop</H2>
    <OL>
      <li>Run an evaluation to find weak areas.</li>
      <li>Use <strong>cluster analysis</strong> to group failures into patterns.</li>
      <li>Open the linked traces to see where each one went wrong.</li>
      <li>Change the instructions, tools or retrieval.</li>
      <li>Re-evaluate and <strong>compare runs</strong> to confirm the fix helped.</li>
    </OL>
    <H3>Improve automatically</H3>
    <UL>
      <li><strong>Prompt optimizer:</strong> improves agent instructions using evaluation results.</li>
      <li><strong>Agent optimizer (preview):</strong> generates better instructions, skills, tool descriptions and model selections against a target dataset.</li>
    </UL>
    <H2>AI Red Teaming Agent</H2>
    <P>This runs automated adversarial scans, locally or in the cloud. It reports the <strong>Attack Success Rate</strong>, and lower is better. To test agents against prohibited actions, you review and confirm a generated taxonomy of those actions first. It's then used to generate attack prompts and score the results.</P>
  </>
);

export default function Evaluation() {
  return (
    <ModulePage id="evaluation"
      intro="Measure whether a model or agent is accurate, safe and doing its job, before release and after."
      tabs={[
        { id: 'evaluators', label: 'Evaluators', content: <Evaluators /> },
        { id: 'workflow', label: 'Workflow & red teaming', content: <Workflow /> },
      ]}
      sources={[
        ['Evaluation in Microsoft Foundry', 'https://learn.microsoft.com/azure/foundry/concepts/evaluation-overview'],
        ['Built-in evaluators reference', 'https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators'],
        ['Evaluate your AI agents', 'https://learn.microsoft.com/azure/foundry/observability/how-to/evaluate-agent'],
        ['Run evaluations from the portal', 'https://learn.microsoft.com/azure/foundry/how-to/evaluate-generative-ai-app'],
        ['Evaluation datasets', 'https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets'],
        ['Set up continuous evaluation', 'https://learn.microsoft.com/azure/foundry/observability/how-to/how-to-monitor-agents-dashboard#set-up-continuous-evaluation'],
        ['Run AI Red Teaming Agent in the cloud', 'https://learn.microsoft.com/azure/foundry/how-to/develop/run-ai-red-teaming-cloud'],
        ['How to evaluate Voice Live agents (score scales)', 'https://learn.microsoft.com/azure/ai-services/speech-service/how-to-voice-live-evaluate'],
      ]} />
  );
}
