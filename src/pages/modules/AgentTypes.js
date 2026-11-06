import { useState } from 'react';
import ModulePage from '../../components/ModulePage';
import { C, Callout, Choice, Code, H2, H3, OL, P, Panel, Table, UL } from '../../components/ui';

const Picker = () => {
  const [voice, setVoice] = useState('no');
  const [code, setCode] = useState('no');
  const [saved, setSaved] = useState('yes');
  let answer;
  if (saved === 'no') answer = { name: 'Responses API (ephemeral agent)', why: 'Your application owns the definition and can change model, instructions and tools on each request. There is no agent resource to manage, but features that need a saved agent, such as the prompt-agent optimizer, are unavailable.' };
  else if (code === 'yes') answer = { name: 'Hosted agent', why: 'You bring your own code or framework as a container or .zip. Foundry supplies the endpoint, scaling, identity, session state and observability. You pay for container compute as well.' };
  else if (voice === 'yes') answer = { name: 'Voice-based prompt agent', why: 'Foundry manages the voice orchestration through Voice Live. You connect over a real-time WebSocket instead of sending text requests.' };
  else answer = { name: 'Prompt agent', why: 'Define instructions, a model and tools. Foundry runs it with no code or infrastructure. This is the recommended starting point.' };
  return (
    <Panel title="Which agent type?">
      <Choice label="Should Foundry store and version the agent?" value={saved} onChange={setSaved} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No, my app defines it per request' }]} />
      <Choice label="Do you need your own orchestration code, framework or custom protocol?" value={code} onChange={setCode} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
      <Choice label="Is it a real-time spoken conversation?" value={voice} onChange={setVoice} options={[{ value: 'no', label: 'No, text' }, { value: 'yes', label: 'Yes, voice' }]} />
      <div className="rounded-lg bg-azure-50 p-4" aria-live="polite">
        <div className="text-lg font-bold text-slate-900">{answer.name}</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{answer.why}</p>
      </div>
    </Panel>
  );
};

const Types = () => (
  <>
    <H2>A spectrum from declarative to full code</H2>
    <Picker />
    <Table head={['', 'Prompt agent', 'Voice-based prompt agent', 'Hosted agent']} rows={[
      ['Authored with', 'Portal, azd, SDK or REST', 'Portal, SDK or REST', 'Agent Framework, LangGraph, OpenAI Agents SDK, Anthropic Agent SDK, custom code'],
      ['Runtime code you maintain', 'None', 'None for voice orchestration', 'Your agent logic'],
      ['Compute', 'Fully managed', 'Fully managed', 'Container compute, Foundry-managed'],
      ['Endpoint', 'Managed', 'Real-time WebSocket', 'Managed'],
      ['Entra identity', 'Yes', 'Yes', 'Automatic, dedicated per agent'],
      ['Cost', 'Inference + tools', 'Voice Live + model usage', 'Inference + tools + compute'],
    ]} />
    <H2>Choose a hosted agent when you need to</H2>
    <UL>
      <li>Bring your own framework or orchestration code.</li>
      <li>Accept webhooks or non-OpenAI payloads (the Invocations protocol).</li>
      <li>Control the CPU and memory of the sandbox.</li>
      <li>Persist files and state across turns through <C>$HOME</C> and <C>/files</C>.</li>
      <li>Keep long-running work going across process interruptions.</li>
    </UL>
    <P>Each hosted agent session runs in its own VM-isolated sandbox, which can scale to zero and resume with its state restored. You ship a container image, or a .zip that Foundry builds into an image. Hosted agents are edited in code, not in the portal's agent builder, but you can still invoke, evaluate, monitor and publish them.</P>
    <Callout kind="exam">
      "No infrastructure to manage" points to a <strong>prompt agent</strong>. "Existing LangGraph code" points to a <strong>hosted agent</strong>. "Agent already runs elsewhere and just needs Foundry models and tools" points to the <strong>Responses API</strong>.
    </Callout>
    <Callout kind="preview" title="Preview: Microsoft Copilot harness">
      A prompt agent can select the Copilot harness for multi-step tool, skill, file and command workflows without operating harness code. It stays a prompt agent. Each response must specify a <C>conversation</C>, it doesn't support <C>previous_response_id</C>, and function tools can't use <C>strict: true</C>.
    </Callout>
  </>
);

const Define = () => (
  <>
    <H2>Designing the agent</H2>
    <Table head={['Decision', 'Where it goes', 'Example']} rows={[
      ['Role', 'Instructions', '"You help Contoso Outdoors customers with orders and returns."'],
      ['Goal and limits', 'Instructions', '"Answer policy questions only from the returns policy. If unsure, offer a human."'],
      ['Output style', 'Instructions, or structured outputs', '"Reply in under 80 words and cite the policy section."'],
      ['Capabilities', 'Tools', 'lookup_order function, file search'],
      ['Conversation tracking', 'Conversations', 'One conversation per chat session'],
      ['Long-term personalisation', 'Memory tool', 'Remember a customer\'s preferred language'],
      ['Per-request values', 'Structured inputs', 'Pass {{userName}} at runtime'],
    ]} />
    <H2>Create and version an agent</H2>
    <Code title="Python: create a new version and chat" code={`
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition

project = AIProjectClient(
    endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
    credential=DefaultAzureCredential(),
)

# Creates the agent, or a new version if the name already exists
agent = project.agents.create_version(
    agent_name="contoso-support",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",
        instructions="You help Contoso Outdoors customers with orders and returns.",
    ),
)

# An OpenAI client bound to this agent
openai = project.get_openai_client(agent_name=agent.name)

conversation = openai.conversations.create()      # keeps history across turns
first = openai.responses.create(conversation=conversation.id, input="Can I return boots?")
second = openai.responses.create(conversation=conversation.id, input="And how long do I have?")
print(second.output_text)                         # "how long" resolves from the history
`} />
    <H3>Facts to keep straight</H3>
    <UL>
      <li>An agent's <strong>name can't be changed</strong> after creation. In code you refer to it as <C>name:version</C>.</li>
      <li>Each change creates a new <strong>agent version</strong>, which is what makes rollback possible.</li>
      <li>Agents are created inside a project and can only use that project's files, conversations and indexes.</li>
    </UL>
    <H2>Conversation tracking options</H2>
    <Table head={['Approach', 'How', 'Use when']} rows={[
      ['Conversation', <><C>conversation=conversation.id</C></>, 'Multi-turn chat where Foundry stores the history. The usual choice for agents'],
      ['Chained responses', <><C>previous_response_id=response.id</C></>, 'Continuing from one response, where the runtime supports it'],
      ['Stateless', 'Send the full history yourself', 'Your app owns state, or hides it from the service'],
      ['Memory', 'Memory search tool', 'Facts that must survive beyond one conversation'],
    ]} />
    <Callout kind="trap" title="Common trap: conversation vs memory">
      A conversation holds one chat's history. Memory holds extracted facts across <em>different</em> conversations. "Remember the customer's allergy next week" needs memory. "Understand 'it' in my follow-up question" only needs a conversation.
    </Callout>
    <H2>Pass values at runtime with structured inputs</H2>
    <Code title="Python: handlebars in instructions" code={`
from azure.ai.projects.models import PromptAgentDefinition, StructuredInputDefinition

agent = project.agents.create_version(
    agent_name="structured-input-agent",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",
        instructions="The user's name is {{userName}}. Greet them by name.",
        structured_inputs={
            "userName": StructuredInputDefinition(
                description="The user's name", required=True, schema={"type": "string"},
            ),
        },
    ),
)

with project.get_openai_client(agent_name=agent.name) as openai:
    response = openai.responses.create(
        input="Hello!",
        extra_body={"structured_inputs": {"userName": "Alice"}},
    )
`} />
    <H2>Publish it</H2>
    <OL>
      <li>Test in the agents playground.</li>
      <li>Promote the agent to a managed resource with a stable endpoint.</li>
      <li>Share it through Microsoft Teams, Microsoft Copilot or the Entra Agent Registry.</li>
    </OL>
  </>
);

export default function AgentTypes() {
  return (
    <ModulePage id="agent-types"
      intro="Choose the right type of agent, then define its role, goals and conversation handling in code."
      tabs={[
        { id: 'types', label: 'Agent types', content: <Types /> },
        { id: 'define', label: 'Define & version', content: <Define /> },
      ]}
      sources={[
        ['Agents in Microsoft Foundry', 'https://learn.microsoft.com/azure/foundry/agents/overview'],
        ['What are prompt agents?', 'https://learn.microsoft.com/azure/foundry/agents/concepts/prompt-agents'],
        ['What are hosted agents?', 'https://learn.microsoft.com/azure/foundry/agents/concepts/hosted-agents'],
        ['Agent development lifecycle', 'https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle'],
        ['Quickstart: Create a prompt agent', 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent'],
        ['Structured inputs', 'https://learn.microsoft.com/azure/foundry/agents/how-to/structured-inputs'],
        ['Use tools and skills with the Copilot harness', 'https://learn.microsoft.com/azure/foundry/agents/how-to/use-tools-skills-copilot-harness'],
      ]} />
  );
}
