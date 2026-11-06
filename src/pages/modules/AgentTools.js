import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, Flow, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Catalog = () => (
  <>
    <H2>Pick a tool for the job</H2>
    <Table head={['Tool', 'Use it for', 'Runs where']} rows={[
      ['Function calling', 'Your own business logic, like an order lookup', 'In your app. The model only requests the call'],
      ['OpenAPI', 'A REST API described by an OpenAPI spec', 'Called by the service'],
      ['MCP', 'Tools exposed by a remote MCP server', 'On the remote server'],
      ['File search', 'Documents uploaded to a vector store', 'Foundry-managed'],
      ['Azure AI Search', 'An existing enterprise search index', 'Your search service'],
      ['Foundry IQ knowledge base', 'Curated content across several sources', 'Through its MCP endpoint'],
      ['Web search', 'Current public information, with citations', 'Grounding with Bing'],
      ['Code interpreter', 'Running Python to analyse data or calculate', 'Sandbox'],
      ['Memory search', 'Facts about a user across sessions (preview)', 'Managed memory store'],
    ]} />
    <Callout kind="trap" title="Common trap: web search and compliance">
      Web search uses Grounding with Bing. The Microsoft Data Protection Addendum doesn't apply to data sent to it, and data can cross compliance and geographic boundaries. A scenario with strict residency rules shouldn't use it without review.
    </Callout>
    <H2>Toolboxes</H2>
    <P>A <strong>toolbox</strong> groups tools into one reusable unit behind a single MCP-compatible endpoint. You curate it once, and any agent or runtime can use it. Authentication, governance and versioning are central, so you update tools in one place rather than rewiring each agent. It's Microsoft's recommended way to add tools.</P>
    <H2>Retrieval vs memory: choose correctly</H2>
    <Table head={['You need to', 'Use', 'Why']} rows={[
      ['Ground the agent on curated company content', 'Foundry IQ knowledge base', 'Multi-source, permission-aware, shared across agents'],
      ['Search documents a user supplied in this interaction', 'File search', 'Quick, with no search service for you to run'],
      ['Query an existing tuned search index', 'Azure AI Search tool', 'Full control over the index and query type'],
      ['Remember a user\'s preferences across sessions', 'Memory', 'Learned over time and scoped per user'],
      ['Get today\'s public information', 'Web search', 'Current data with citations'],
    ]} />
  </>
);

const Functions = () => (
  <>
    <H2>How function calling works</H2>
    <Flow steps={[
      { title: 'Define', sub: 'Name, schema, description' },
      { title: 'Prompt', sub: 'User asks a question' },
      { title: 'Model requests', sub: <>Returns <C>function_call</C></> },
      { title: 'Your app runs it', sub: 'Validates and executes' },
      { title: 'Return output', sub: <><C>function_call_output</C></> },
      { title: 'Final answer', sub: 'Model uses the result' },
    ]} />
    <Callout kind="exam">
      <strong>The model never runs your function.</strong> It asks your app to run it, and your app submits the output. If the agent returns a function call but no final answer, the usual cause is that the output was never sent back.
    </Callout>
    <Code title="Python: a prompt agent with a function tool" code={`
import json
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, FunctionTool
from azure.identity import DefaultAzureCredential
from openai.types.responses.response_input_param import FunctionCallOutput

def lookup_order(order_id: str) -> str:
    return json.dumps({"order_id": order_id, "status": "shipped"})

tool = FunctionTool(
    name="lookup_order",
    description="Get the shipping status of an order by its ID.",
    parameters={
        "type": "object",
        "properties": {"order_id": {"type": "string", "description": "An order ID such as A1042"}},
        "required": ["order_id"],
        "additionalProperties": False,
    },
    strict=True,
)

with AIProjectClient(endpoint=ENDPOINT, credential=DefaultAzureCredential()) as project:
    agent = project.agents.create_version(
        agent_name="contoso-support",
        definition=PromptAgentDefinition(
            model="gpt-5-mini",
            instructions="Use lookup_order to answer order questions.",
            tools=[tool],
        ),
    )

    with project.get_openai_client(agent_name=agent.name) as openai:
        conversation = openai.conversations.create()
        response = openai.responses.create(conversation=conversation.id, input="Where is order A1042?")

        outputs = []
        for item in response.output:
            if item.type == "function_call" and item.name == "lookup_order":
                result = lookup_order(**json.loads(item.arguments))
                outputs.append(FunctionCallOutput(
                    type="function_call_output", call_id=item.call_id, output=result,
                ))

        # Send results back in the same conversation for the final answer
        response = openai.responses.create(conversation=conversation.id, input=outputs)
        print(response.output_text)
`} />
    <H2>Facts and fixes</H2>
    <UL>
      <li><strong>Runs expire after 10 minutes.</strong> For slow operations, return a status right away and poll separately.</li>
      <li>You can run agents with function tools in the portal, but you can't <strong>add, remove or update</strong> function definitions there. Use the SDK or REST.</li>
      <li>The model may request <strong>several functions</strong> in one response. Handle them all and return all the results together.</li>
      <li><C>strict: true</C> enforces your schema. Structured outputs aren't supported with parallel function calls, so set <C>parallel_tool_calls</C> to false if you need both.</li>
    </UL>
    <Table head={['Symptom', 'Fix']} rows={[
      ['Function never gets called', 'Confirm it\'s on the agent, and use clear names and descriptions'],
      ['Called with the wrong values', 'Improve the description. Add parameter descriptions with examples'],
      ['Required fields missing', 'Add a required array, and set strict: true where supported'],
      ['Tool outputs rejected', 'The run expired. Return outputs within 10 minutes'],
    ]} />
    <Callout kind="trap">
      Treat arguments and tool output as untrusted input. Validate them, don't return secrets, and require confirmation before actions that change data.
    </Callout>
  </>
);

const Mcp = () => (
  <>
    <H2>Connecting an MCP server</H2>
    <Code title="Python: MCP tool that requires approval" code={`
from azure.ai.projects.models import PromptAgentDefinition, MCPTool
from openai.types.responses.response_input_param import McpApprovalResponse

tool = MCPTool(
    server_label="api-specs",
    server_url="https://api.githubcopilot.com/mcp",
    require_approval="always",
    allowed_tools=["get_me"],              # a non-empty list restricts access
    project_connection_id="my-mcp-connection",
)

agent = project.agents.create_version(
    agent_name="github-helper",
    definition=PromptAgentDefinition(model="gpt-5-mini", instructions="Use MCP tools as needed.", tools=[tool]),
)

with project.get_openai_client(agent_name=agent.name) as openai:
    conversation = openai.conversations.create()
    response = openai.responses.create(conversation=conversation.id, input="What is my GitHub username?")

    approvals = []
    for item in response.output:
        if item.type == "mcp_approval_request":
            print("Wants to call:", item.server_label, item.name, item.arguments)
            approvals.append(McpApprovalResponse(
                type="mcp_approval_response",
                approve=True,                      # your own review logic goes here
                approval_request_id=item.id,
            ))

    if approvals:
        response = openai.responses.create(conversation=conversation.id, input=approvals)
    print(response.output_text)
`} />
    <Callout kind="trap" title="Common trap: an empty allowed_tools list">
      <C>allowed_tools=[]</C> allows <strong>all</strong> tools on the server, not zero. To restrict access, you need a non-empty list of tool names.
    </Callout>
    <H2>Tool-access controls</H2>
    <Table head={['Control', 'What it does']} rows={[
      [<C>allowed_tools</C>, 'Limits which server tools the agent can call'],
      [<><C>require_approval: "always"</C></>, 'A person reviews the tool name and arguments before each call'],
      ['Connection auth', 'Decides which identity reaches the downstream service'],
      ['Agent identity and RBAC', 'Limits what the agent can touch in Azure'],
      ['Tool call and tool response guardrails (preview)', 'Scans data going to and coming from tools'],
      ['AI Gateway (preview)', 'Central routing and policy for MCP tools'],
    ]} />
    <Callout kind="exam" title="Exam focus: who enforces approval?">
      For a <strong>toolbox used by a hosted agent</strong>, the MCP endpoint doesn't block <C>tools/call</C> when <C>require_approval</C> is <C>always</C>. <strong>Your agent runtime must enforce it</strong>, and a system-prompt instruction alone doesn't count. Use <C>never</C> unless your runtime can pause, collect a decision, and resume or reject that exact call.
    </Callout>
    <H3>MCP good practice</H3>
    <UL>
      <li>Treat tool descriptions and results from remote servers as untrusted. They can carry indirect prompt injection.</li>
      <li>Require approval for tools that write data or change resources.</li>
      <li>Log approvals and tool calls for audit.</li>
      <li>Review your settings when the server's operator, tools or behaviour change.</li>
      <li>Custom MCP servers can run on Azure Functions through <C>/runtime/webhooks/mcp</C>.</li>
    </UL>
  </>
);

const Memory = () => (
  <>
    <H2>Memory in Foundry Agent Service</H2>
    <Callout kind="preview">Memory and the Memory Store API are in preview.</Callout>
    <Table head={['Memory type', 'Holds', 'When to retrieve']} rows={[
      ['User profile', 'Durable preferences like language or accessibility needs', 'Near the start of each conversation'],
      ['Chat summary', 'Distilled summaries of earlier topics', 'On each turn, using the current messages'],
      ['Procedural', 'Reusable routines inferred from past interactions', 'When the user asks for a recurring task'],
    ]} />
    <H2>How it works</H2>
    <OL>
      <li><strong>Extraction:</strong> pulls key facts from the conversation.</li>
      <li><strong>Consolidation:</strong> uses LLMs to merge duplicates and resolve conflicts, such as a new allergy.</li>
      <li><strong>Retrieval:</strong> searches the store for what's relevant when the agent needs it.</li>
    </OL>
    <H2>Settings to know</H2>
    <Table head={['Setting', 'Purpose']} rows={[
      [<C>scope</C>, 'Partitions memory, per user or team, so people don\'t see each other\'s data'],
      [<C>{'{{$userId}}'}</C>, 'Scope value that resolves to the end user. Pass the x-memory-user-id header on each call. Without it, the scope falls back to the caller\'s Entra identity'],
      [<C>update_delay</C>, 'Waits for a period of inactivity before writing memories, so a chat isn\'t written after every turn'],
      ['Default TTL', 'Store-level retention in seconds for new memories. Explicit "remember" commands don\'t override it'],
    ]} />
    <Callout kind="trap" title="Common trap: scope">
      If you don't scope memory per user, one customer's details could surface for another. Whenever a scenario mentions isolating users, the answer involves <C>scope</C>.
    </Callout>
    <H3>Static vs contextual retrieval</H3>
    <UL>
      <li><strong>Static:</strong> call <C>search_memories</C> with a scope but no items, to get user profile memories for the start of a conversation.</li>
      <li><strong>Contextual:</strong> call <C>search_memories</C> with <C>items</C> set to the latest messages, to get what's relevant to this turn.</li>
    </UL>
    <P>When a user explicitly asks the agent to remember or forget something, the memory tool applies it immediately. For privacy requests you can also create, read, update, list and delete individual memory items.</P>
  </>
);

export default function AgentTools() {
  return (
    <ModulePage id="agent-tools"
      intro="How agents act on the world: picking the right tool, wiring function calls and MCP, and controlling what they're allowed to do."
      tabs={[
        { id: 'catalog', label: 'Choose a tool', content: <Catalog /> },
        { id: 'functions', label: 'Function calling', content: <Functions /> },
        { id: 'mcp', label: 'MCP & approvals', content: <Mcp /> },
        { id: 'memory', label: 'Memory', content: <Memory /> },
      ]}
      sources={[
        ['Toolbox overview', 'https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview'],
        ['Use function calling with Foundry agents', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/function-calling'],
        ['Connect agents to MCP servers', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/model-context-protocol'],
        ['Use a toolbox with a hosted agent', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/use-toolbox-hosted-agent'],
        ['File search tool', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/file-search'],
        ['Web search tool', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/web-search'],
        ['Tool best practices', 'https://learn.microsoft.com/azure/foundry/agents/concepts/tool-best-practice'],
        ['Memory in Foundry Agent Service', 'https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-memory'],
        ['Create and use memory', 'https://learn.microsoft.com/azure/foundry/agents/how-to/memory-usage'],
      ]} />
  );
}
