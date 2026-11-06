import { useState } from 'react';
import ModulePage from '../../components/ModulePage';
import { C, Callout, Choice, Code, Flow, H2, H3, OL, P, Panel, Table, UL } from '../../components/ui';

const patterns = {
  sequential: { label: 'Sequential', steps: [{ title: 'Extract' }, { title: 'Check policy' }, { title: 'Draft reply' }],
    when: 'Each step builds on the previous one, such as document review or multi-stage processing.',
    note: 'By default each agent receives the previous agent\'s full conversation. You can configure it to receive only the response.' },
  concurrent: { label: 'Concurrent', steps: [{ title: 'Same task', sub: 'Fan out' }, { title: 'Agents in parallel', sub: 'Legal, finance, tech' }, { title: 'Aggregate', sub: 'Combine results' }],
    when: 'Independent specialists can work on the same input at once, and their views get combined.',
    note: 'Parallel agents use more tokens at once, so check your rate limits.' },
  groupchat: { label: 'Group chat', steps: [{ title: 'Manager', sub: 'Chooses who speaks' }, { title: 'Writer' }, { title: 'Reviewer' }, { title: 'Back to manager' }],
    when: 'Agents collaborate and iterate, with control passed by context or rules, such as a writer and reviewer loop.',
    note: 'Set a limit on rounds so the conversation can\'t run forever.' },
  handoff: { label: 'Handoff', steps: [{ title: 'Triage agent' }, { title: 'Billing or Returns', sub: 'Takes over' }, { title: 'User', sub: 'Replies directly' }],
    when: 'One specialist takes full control of the conversation, such as routing support requests.',
    note: 'Interactive by default. If an agent responds without handing off, control returns to the user. That\'s what the other patterns don\'t do on their own.' },
};

const PatternExplorer = () => {
  const [key, setKey] = useState('sequential');
  const p = patterns[key];
  return (
    <Panel title="Orchestration patterns">
      <Choice label="Pattern" value={key} onChange={setKey} options={Object.entries(patterns).map(([value, v]) => ({ value, label: v.label }))} />
      <Flow steps={p.steps} />
      <p className="text-sm leading-6 text-slate-700" aria-live="polite"><span className="font-semibold text-slate-900">Use when: </span>{p.when}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-900">Watch out: </span>{p.note}</p>
    </Panel>
  );
};

const Patterns = () => (
  <>
    <H2>Do you need several agents?</H2>
    <P>One agent with several tools is easier to build, test and trace. Add agents when a task needs clearly different instructions or permissions, or when independent specialists improve the result.</P>
    <PatternExplorer />
    <H2>Two ways to build them</H2>
    <Table head={['', 'Foundry workflows (preview)', 'Microsoft Agent Framework']} rows={[
      ['Style', 'Visual and declarative, no code', 'Code, run as a hosted agent or elsewhere'],
      ['Includes', 'Sequential, group chat and human-in-the-loop templates, plus branching and variables', 'Sequential, concurrent, group chat and handoff, plus custom graphs with WorkflowBuilder'],
      ['Choose when', 'A repeatable process built with no code', 'Custom logic, or anything needing version-controlled code'],
    ]} />
    <Callout kind="note">
      Foundry's portal templates differ from the framework's orchestrations, so check which one a question is about. Group chat in the portal is described as passing control dynamically based on context or rules, including escalation and expert handoff.
    </Callout>
    <H2>Observing multi-agent runs</H2>
    <UL>
      <li>A nested <C>invoke_agent</C> span shows one agent calling another.</li>
      <li><C>invoke_workflow</C> covers the whole coordinated flow.</li>
      <li>Tracing for workflow agents is in preview.</li>
    </UL>
  </>
);

const Safeguards = () => (
  <>
    <H2>Autonomy with control</H2>
    <P>How much independence an agent gets should match the cost of a mistake. Reading data can be autonomous. Refunds, deletes and emails should wait for a person.</P>
    <Table head={['Level', 'Agent behaviour', 'Fits']} rows={[
      ['Autonomous', 'Acts without asking', 'Low-risk, reversible, read-only steps'],
      ['Semiautonomous', 'Acts, but pauses at defined checkpoints', 'Most business processes'],
      ['Human-led', 'Suggests, and a person does the work', 'High-impact decisions'],
    ]} />
    <H2>Human-in-the-loop in Agent Framework</H2>
    <Table head={['Need', 'Mechanism', 'Behaviour']} rows={[
      ['Approve or reject a sensitive tool call', <C>@tool(approval_mode="always_require")</C>, 'Workflow pauses and emits a request_info event'],
      ['Review an agent\'s response before the next step', <C>.with_request_info()</C>, 'Pauses after specific agents respond. Python sequential workflows support this directly'],
      ['Multi-turn back-and-forth with the user', 'Handoff orchestration', 'Control returns to the user when the agent doesn\'t hand off'],
      ['Ask the user a typed question at any point', <><C>RequestPort</C> in a custom <C>WorkflowBuilder</C></>, 'Sends a request, and routes the response to an executor'],
    ]} />
    <Code title="Python: sequential workflow with tool approval" code={`
from agent_framework import Agent, tool
from agent_framework.orchestrations import SequentialBuilder  # check the import path for your version

@tool(approval_mode="always_require")          # a person must approve each call
def issue_refund(order_id: str, amount: float) -> str:
    return f"Refunded {amount} on {order_id}"

refund_agent = Agent(
    client=chat_client,
    name="RefundAgent",
    instructions="Process approved refunds.",
    tools=[issue_refund],
)

workflow = SequentialBuilder(participants=[triage_agent, refund_agent]).build()
# When refund_agent tries issue_refund, the workflow pauses with a request_info event.
# Your app shows the call to a person, sends the decision, and the workflow resumes.
`} />
    <Callout kind="trap" title="Common trap: sequential doesn't mean it asks the user">
      Sequential, concurrent and group chat orchestrations don't pause for free-form user input on their own. Tool approval only lets someone accept or reject a specific call. For back-and-forth with the user, use <strong>handoff</strong> or a <C>RequestPort</C>.
    </Callout>
    <H2>Safeguards checklist</H2>
    <OL>
      <li><strong>Give each agent only the tools it needs.</strong> A triage agent shouldn't be able to issue refunds.</li>
      <li><strong>Give each agent its own identity</strong>, with the narrowest roles.</li>
      <li><strong>Require approval</strong> for anything that writes data or changes resources.</li>
      <li><strong>Limit iterations</strong> in group chats and loops to control runaway cost.</li>
      <li><strong>Add guardrails</strong> at tool call and tool response, and use task adherence to flag drift.</li>
      <li><strong>Treat other agents' output as untrusted</strong>, since an injected instruction can pass from one agent to the next.</li>
      <li><strong>Validate structured output</strong> against a schema before acting on it.</li>
      <li><strong>Evaluate and trace</strong> the whole flow, not just each agent.</li>
    </OL>
    <H3>Multistep reasoning without multiple agents</H3>
    <P>Not every pipeline needs agents. A tool-augmented flow can be one agent with tools, and a reasoning pipeline can be a fixed chain of model calls in your own code. Prefer the simplest design that passes your evaluation.</P>
  </>
);

export default function MultiAgent() {
  return (
    <ModulePage id="multi-agent"
      intro="Coordinate several agents with the right orchestration pattern, and decide where a person has to step in."
      tabs={[
        { id: 'patterns', label: 'Patterns', content: <Patterns /> },
        { id: 'safeguards', label: 'Approvals & safeguards', content: <Safeguards /> },
      ]}
      sources={[
        ['Build a workflow in Microsoft Foundry', 'https://learn.microsoft.com/azure/foundry/agents/concepts/workflow'],
        ['Agent Framework: sequential orchestration', 'https://learn.microsoft.com/agent-framework/workflows/orchestrations/sequential'],
        ['Agent Framework: handoff orchestration', 'https://learn.microsoft.com/agent-framework/workflows/orchestrations/handoff'],
        ['Agent Framework: human-in-the-loop', 'https://learn.microsoft.com/agent-framework/workflows/human-in-the-loop'],
        ['Agent tracing overview', 'https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept'],
        ['Tool best practices', 'https://learn.microsoft.com/azure/foundry/agents/concepts/tool-best-practice'],
      ]} />
  );
}
