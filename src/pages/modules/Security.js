import ModulePage from '../../components/ModulePage';
import { C, Callout, Card, Code, Flow, Grid, H2, H3, OL, P, Table, UL } from '../../components/ui';

const yes = '✓';
const no = '–';

const Identity = () => (
  <>
    <H2>Go keyless</H2>
    <P>Microsoft recommends Microsoft Entra ID for authentication. API keys give full access with no role checks, so avoid them in production. With Entra, the same code uses your <C>az login</C> locally and a managed identity in Azure.</P>
    <Code title="Python: no key anywhere in the code" code={`
import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

project = AIProjectClient(
    endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential(),
)
`} />
    <H2>Control plane vs data plane</H2>
    <Grid>
      <Card title="Administration (control plane)">Changing the resource: creating deployments, changing content filters, switching SKU. Always uses Entra ID. Example role: Cognitive Services Contributor.</Card>
      <Card title="Developer (data plane)">Using the resource: calling inference APIs, running agents. Uses Entra ID or keys. Example role: Cognitive Services User.</Card>
    </Grid>
    <Callout kind="trap">
      Having administrative access doesn't grant developer access. It's like a database server: administering the server doesn't let you read the data in it. Someone who can create deployments may still get a 403 calling them.
    </Callout>
    <H2>Foundry built-in roles</H2>
    <Table head={['Role', 'Create projects and accounts', 'Build in a project', 'Manage models', 'Publish agents', 'Call agent endpoints', 'Assign roles']} rows={[
      ['Foundry Agent Consumer', no, no, no, no, yes, no],
      ['Foundry User', no, yes, no, no, yes, no],
      ['Foundry Project Manager', no, yes, no, yes, yes, 'Foundry User only'],
      ['Foundry Account Owner', yes, no, yes, no, no, 'Foundry User, ACR, monitoring'],
      ['Foundry Owner', yes, yes, yes, yes, yes, 'Foundry User, ACR, monitoring'],
    ]} />
    <Callout kind="exam">
      Least-privilege questions come down to this table. An app that only calls an agent needs <strong>Foundry Agent Consumer</strong>. A developer who builds agents needs <strong>Foundry User</strong>. Foundry Account Owner manages models and resources but <em>can't</em> build in a project.
    </Callout>
    <H3>Minimum assignments to get started</H3>
    <OL>
      <li>Foundry User on the Foundry resource for your <strong>user principal</strong>.</li>
      <li>Foundry User on the Foundry resource for the <strong>project's managed identity</strong>.</li>
      <li>Cognitive Services Usages Reader at subscription scope, if someone needs to view quota.</li>
    </OL>
    <H2>Which identity is calling?</H2>
    <Table head={['Identity', 'Used for']} rows={[
      ['User principal', 'A person using the portal or local code'],
      ['Project managed identity', 'The project reaching connected resources such as Azure AI Search'],
      ['Agent identity', 'A dedicated Entra identity for an agent, giving scoped access without shared credentials. Hosted agents get one automatically'],
      ['On-Behalf-Of passthrough', 'A tool acts with the end user\'s identity, so their permissions apply'],
    ]} />
    <P>Tool connections support key-based access, Microsoft Entra (agent or project managed identity), OAuth identity passthrough, and unauthenticated access where appropriate.</P>
    <H3>Example: keyless access to Azure AI Search</H3>
    <OL>
      <li>Enable role-based access on the search service.</li>
      <li>Give the project managed identity <strong>Search Index Data Reader</strong> so it can read indexed content.</li>
      <li>Give developers <strong>Search Service Contributor</strong> and <strong>Search Index Data Contributor</strong> to create objects and load data.</li>
    </OL>
  </>
);

const Setups = () => (
  <>
    <H2>Three agent environment setups</H2>
    <Table head={['Setup', 'Where agent data lives', 'Choose it when']} rows={[
      ['Basic', 'Platform-managed storage', 'You want to start quickly and have no data ownership requirement'],
      ['Standard', 'Your own Azure Storage, Cosmos DB and Azure AI Search', 'You need ownership and control of files, conversations and vector stores'],
      ['Standard with your own VNet', 'Your own resources, inside your virtual network', 'You need end-to-end network isolation'],
    ]} />
    <Callout kind="exam">
      The phrase "all customer data must stay in our own Azure resources" points to <strong>standard setup</strong>, and it needs all three resources: Storage, Cosmos DB and AI Search. Supplying only some of them fails with a capability host error.
    </Callout>
    <H2>Private networking</H2>
    <Flow steps={[
      { title: 'Client in your VNet', sub: 'VPN, ExpressRoute or a jumpbox' },
      { title: 'Private endpoint', sub: 'Inbound to Foundry, public access disabled' },
      { title: 'Delegated subnet', sub: 'Agent runtime, injected into your VNet' },
      { title: 'Your resources', sub: 'Storage, Cosmos DB, AI Search via private endpoints' },
    ]} />
    <H3>Details that show up in questions</H3>
    <UL>
      <li>The agent subnet must be <strong>delegated to <C>Microsoft.App/environments</C></strong> and be <strong>/27 or larger</strong>.</li>
      <li>Use a valid private range: <C>10.0.0.0/8</C>, <C>172.16.0.0/12</C> or <C>192.168.0.0/16</C>.</li>
      <li>Private endpoints to Storage, Cosmos DB and AI Search are <strong>not created automatically</strong>. Create them on those resources.</li>
      <li>Set <strong>public network access to Disabled</strong> on each resource, then check DNS resolution from inside the VNet.</li>
      <li>Register <C>Microsoft.App</C> and <C>Microsoft.ContainerService</C>, among others, or deployment fails.</li>
      <li>Capability settings can't be updated later. If they're wrong, delete and recreate the project.</li>
      <li>Bicep and Terraform templates for these setups are in the <C>foundry-samples</C> repository.</li>
    </UL>
    <H2>Defense in depth</H2>
    <Grid cols={3}>
      <Card title="Foundry guardrails">Content filters, Prompt Shields and abuse detection at the model layer.</Card>
      <Card title="Defender for Cloud">Security posture recommendations, and threat protection that detects jailbreak and user input attacks.</Card>
      <Card title="Microsoft Purview">Auditing, sensitive information classification and data security posture for prompts and responses.</Card>
    </Grid>
    <Callout kind="note">
      Purview Data Security Policies need Entra user-context tokens, because they attach policies to user interactions. An app that calls with only a service identity won't get them.
    </Callout>
    <H2>Securing what agents can do</H2>
    <UL>
      <li>Give each agent its own identity with the narrowest roles.</li>
      <li>Don't put keys or tokens in prompts, tool arguments or code. Store them on project connections.</li>
      <li>Use <C>allowed_tools</C> and approvals to limit MCP tools.</li>
      <li>Hosted agents can add network egress controls (preview), so an agent can only reach destinations you allow.</li>
      <li>AI Gateway adds centralised routing and policy for MCP tools (preview).</li>
    </UL>
  </>
);

export default function Security() {
  return (
    <ModulePage id="security"
      intro="Who and what can reach your AI resources, where agent data lives, and how to isolate it all from the public internet."
      tabs={[
        { id: 'identity', label: 'Identity & roles', content: <Identity /> },
        { id: 'network', label: 'Infrastructure & network', content: <Setups /> },
      ]}
      sources={[
        ['Role-based access control for Foundry', 'https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry'],
        ['Configure keyless authentication with Entra ID', 'https://learn.microsoft.com/azure/foundry/foundry-models/how-to/configure-entra-id'],
        ['Set up your agent environment', 'https://learn.microsoft.com/azure/foundry/agents/environment-setup'],
        ['Set up private networking for Agent Service', 'https://learn.microsoft.com/azure/foundry/agents/how-to/virtual-networks'],
        ['Use your own resources', 'https://learn.microsoft.com/azure/foundry/agents/how-to/use-your-own-resources'],
        ['Manage compliance and security in Foundry', 'https://learn.microsoft.com/azure/foundry/control-plane/how-to-manage-compliance-security'],
        ['Connect an Azure AI Search index to agents', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/ai-search'],
        ['Tool best practices', 'https://learn.microsoft.com/azure/foundry/agents/concepts/tool-best-practice'],
      ]} />
  );
}
