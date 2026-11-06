import ModulePage from '../../components/ModulePage';
import { C, Callout, Card, Code, Flow, Grid, H2, H3, P, Table, UL } from '../../components/ui';

const Overview = () => (
  <>
    <H2>What Microsoft Foundry is</H2>
    <P>Foundry brings agents, models and tools together under one Azure resource, with shared access control, networking and policy. Tracing, monitoring and evaluation are built in.</P>
    <H2>The resource hierarchy</H2>
    <Flow steps={[
      { title: 'Subscription', sub: 'Billing and quota boundary' },
      { title: 'Resource group', sub: 'Lifecycle grouping' },
      { title: 'Foundry resource', sub: 'Model deployments, RBAC, networking' },
      { title: 'Foundry project', sub: 'Agents, files, indexes, evaluations' },
    ]} />
    <Grid>
      <Card title="Foundry resource (the account)">The top-level Azure resource. Connected to your subscription, it holds model deployments and the shared security configuration. Administrators work here.</Card>
      <Card title="Foundry project (the workspace)">The unit of sharing and isolation. Agents in a project share file storage, conversation storage and search indexes. Agents in one project can't reach another project's resources.</Card>
    </Grid>
    <Callout kind="exam">
      Teams that must not see each other's agents or files need <strong>separate projects</strong>. The project is the isolation boundary.
    </Callout>
    <H2>Which Foundry service for which job?</H2>
    <Table head={['You need', 'Use', 'Details']} rows={[
      ['A one-off prompt with no tools', 'A model deployment and the Responses API', <a className="text-azure-600 underline" href="#/model-selection">Choosing a Model</a>],
      ['An agent with instructions and tools, no code to host', 'Prompt agent in Foundry Agent Service', <a className="text-azure-600 underline" href="#/agent-types">Building Agents</a>],
      ['Your own framework or orchestration code', 'Hosted agent', <a className="text-azure-600 underline" href="#/agent-types">Building Agents</a>],
      ['A repeatable multi-agent process without code', 'Foundry workflow', <a className="text-azure-600 underline" href="#/multi-agent">Multi-Agent Workflows</a>],
      ['Grounding on company content', 'Azure AI Search or a Foundry IQ knowledge base', <a className="text-azure-600 underline" href="#/ai-search">AI Search & RAG</a>],
      ['Search over documents a user just uploaded', 'File search tool', <a className="text-azure-600 underline" href="#/agent-tools">Agent Tools</a>],
      ['Remembering a user across sessions', 'Memory in Foundry Agent Service', <a className="text-azure-600 underline" href="#/agent-tools">Agent Tools</a>],
      ['Fields from documents, images, audio or video', 'Azure Content Understanding', <a className="text-azure-600 underline" href="#/content-understanding">Content Understanding</a>],
      ['Filtering harmful content and prompt attacks', 'Guardrails and controls', <a className="text-azure-600 underline" href="#/guardrails">Guardrails</a>],
    ]} />
  </>
);

const Names = () => (
  <>
    <H2>Old name, new name</H2>
    <P>Foundry was renamed and restructured recently, and a lot of older study material uses the previous terms. This is the table to learn first if you've used Azure AI before.</P>
    <Table head={['Area', 'Previous', 'Current']} rows={[
      ['Brand', 'Azure AI Studio, Azure AI Foundry', 'Microsoft Foundry'],
      ['Brand', 'Azure AI Services', 'Foundry Tools'],
      ['Portal', 'Foundry (classic)', 'Foundry (the new portal)'],
      ['Agent API', 'Assistants API (Agents v0.5/v1)', 'Responses API (Agents v2)'],
      ['API versions', 'Monthly api-version parameters', <>v1 stable routes (<C>/openai/v1/</C>)</>],
      ['Resource model', 'Hub + Azure OpenAI + Azure AI Services', 'One Foundry resource with projects'],
      ['SDK', 'azure-ai-inference, azure-ai-generative, azure-ai-ml, AzureOpenAI()', <><C>azure-ai-projects</C> 2.x + <C>OpenAI()</C> against one project endpoint</>],
      ['Concepts', 'Threads, Messages, Runs, Assistants', 'Conversations, Items, Responses, Agent Versions'],
      ['Roles', 'Azure AI User, Azure AI Owner, Azure AI Account Owner, Azure AI Project Manager', 'Foundry User, Foundry Owner, Foundry Account Owner, Foundry Project Manager'],
    ]} />
    <Callout kind="trap">
      You may still see old names in places while the renames roll out, including possibly in exam wording. The study guide itself still links to "Azure AI services" pages. Know both names for each concept. Role IDs and permissions didn't change with the rename.
    </Callout>
    <P>Hub-based projects still work, but only in the classic portal, and Microsoft says new investment goes to Foundry projects. An existing Azure OpenAI resource can be upgraded to a Foundry resource while keeping its endpoint, keys and state.</P>
  </>
);

const Connect = () => (
  <>
    <H2>Connect an application to a project</H2>
    <P>You need two things: the <strong>project endpoint</strong> and an <strong>Entra identity with a role</strong> on the resource.</P>
    <Code title="Endpoint format" code={`https://<resource-name>.services.ai.azure.com/api/projects/<project-name>`} />
    <Code title="Install" code={`pip install "azure-ai-projects>=2.3.0" azure-identity`} />
    <Code title="Python: connect and make a model call" code={`
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

project = AIProjectClient(
    endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
    credential=DefaultAzureCredential(),   # az login locally, managed identity in Azure
)

# An OpenAI client already pointed at this project
openai = project.get_openai_client()

response = openai.responses.create(
    model="gpt-5-mini",   # your deployment name
    input="Summarize our returns policy in one sentence.",
)
print(response.output_text)
`} />
    <Callout kind="trap">
      Code for <C>azure-ai-projects</C> 2.x isn't compatible with 1.x. If a sample uses <C>threads</C>, <C>runs</C> or <C>create_agent</C>, it's the older API. Look for <C>create_version</C> and <C>responses.create</C> instead.
    </Callout>
    <H3>Connections</H3>
    <P>A project connection stores how to reach another resource, such as Azure AI Search, Application Insights or an MCP server. Tools refer to the connection rather than holding credentials in code. Prefer Microsoft Entra authentication over keys wherever the target supports it.</P>
    <H2>Choose a developer surface</H2>
    <Table head={['Surface', 'Best for']} rows={[
      ['Foundry portal', 'Exploring models, prototyping prompts, building prompt agents without code'],
      ['SDKs', 'Building applications in Python, C#, JavaScript or Java'],
      ['Azure Developer CLI (azd)', 'Scaffolding, running, testing and deploying hosted agent projects'],
      ['Visual Studio Code', 'Building and debugging agents with the Foundry extension'],
      ['Coding agents and MCP', 'Driving Foundry from tools such as GitHub Copilot or Claude Code'],
    ]} />
    <UL>
      <li>The exam expects Python, so the samples on this site use Python.</li>
      <li>To consume Foundry as a connector in other tools, use the MCP-compatible endpoints that toolboxes and knowledge bases expose.</li>
    </UL>
  </>
);

export default function FoundryPlatform() {
  return (
    <ModulePage id="foundry-platform"
      intro="What Foundry is, how its resources fit together, which service solves which problem, and how an application connects to it."
      tabs={[
        { id: 'overview', label: 'Overview', content: <Overview /> },
        { id: 'names', label: 'Old vs new names', content: <Names /> },
        { id: 'connect', label: 'Connect an app', content: <Connect /> },
      ]}
      sources={[
        ['What is Microsoft Foundry?', 'https://learn.microsoft.com/azure/foundry/what-is-foundry'],
        ['Microsoft Foundry architecture', 'https://learn.microsoft.com/azure/foundry/concepts/architecture'],
        ['Microsoft Foundry capability reference', 'https://learn.microsoft.com/azure/foundry/concepts/capability-reference'],
        ['Set up your agent environment', 'https://learn.microsoft.com/azure/foundry/agents/environment-setup'],
        ['Quickstart: Create a prompt agent', 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent'],
        ['Role-based access control for Foundry', 'https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry'],
      ]} />
  );
}
