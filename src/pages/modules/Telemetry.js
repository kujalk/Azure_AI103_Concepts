import ModulePage from '../../components/ModulePage';
import { C, Callout, Card, Code, Flow, Grid, H2, H3, OL, P, Table, UL } from '../../components/ui';
import TraceExplorer from '../../interactive/TraceExplorer';

const BigPicture = () => (
  <>
    <H2>Three capabilities that work together</H2>
    <Grid cols={3}>
      <Card title="Tracing: what happened?">Records each model call, tool call and decision in a single run. You use it to debug one request.</Card>
      <Card title="Monitoring: how is it doing?">Dashboards and alerts for tokens, latency, success rate and quality scores across all runs.</Card>
      <Card title="Evaluation: is it any good?">Scores quality and safety on test data or sampled production traffic. See the <a className="text-azure-600 underline" href="#/evaluation">Evaluation</a> page.</Card>
    </Grid>
    <H2>How telemetry travels</H2>
    <Flow steps={[
      { title: 'Agent run', sub: 'Model calls, tools, memory, retrieval' },
      { title: 'OpenTelemetry spans', sub: 'Named by gen_ai conventions' },
      { title: 'Application Insights', sub: 'The store, connected to your project' },
      { title: 'Foundry portal', sub: 'Traces and Monitor tabs' },
      { title: 'Azure Monitor', sub: 'KQL, workbooks, alerts' },
    ]} />
    <P>Foundry doesn't keep traces in a separate store. <strong>They live in the Application Insights resource connected to your project</strong>, so retention, sampling, cost and access all follow that resource's configuration.</P>
    <H2>The vocabulary</H2>
    <Table head={['Term', 'Meaning', 'Example']} rows={[
      ['Trace', 'The whole journey of one request', 'One customer question, start to finish'],
      ['Span', 'One timed operation in a trace, which can nest', <C>execute_tool lookup_order</C>],
      ['Attribute', 'A key-value pair on a span', <C>gen_ai.usage.input_tokens = 412</C>],
      ['Semantic conventions', 'Agreed names for attributes, so tools can read each other\'s data', <C>gen_ai.*</C>],
      ['Exporter', 'Sends spans to a backend', 'Azure Monitor, console or OTLP'],
    ]} />
    <H2>What's generally available</H2>
    <Table head={['Item', 'Status']} rows={[
      ['Tracing for prompt and hosted agents', 'Generally available'],
      ['Tracing for workflow and external agents', 'Preview'],
      ['Client-side GenAI tracing in the SDK', 'Preview, and you must opt in'],
      ['Agent Monitoring Dashboard, recurring evaluations, red team scans, alerts', 'Preview'],
    ]} />
    <Callout kind="exam">
      The study guide says most questions cover GA features, with preview features included if they're commonly used. So learn these preview features too, but expect the core Application Insights and server-side tracing story first.
    </Callout>
  </>
);

const Explore = () => (
  <>
    <TraceExplorer />
    <H2>The span names to recognise</H2>
    <Table head={['Span', 'Records']} rows={[
      [<C>invoke_agent</C>, 'An agent invocation. A nested one means an agent called another agent'],
      [<C>invoke_workflow</C>, 'A coordinated workflow containing agents or other GenAI operations'],
      [<C>plan</C>, 'A planning or task decomposition phase'],
      [<C>execute_tool</C>, 'A tool execution'],
      [<><C>create_memory</C>, <C>search_memory</C>, <C>update_memory</C>, <C>upsert_memory</C>, <C>delete_memory</C></>, 'Memory operations'],
    ]} />
    <H2>Error analysis: read the trace in this order</H2>
    <OL>
      <li><strong>Did it fail or just answer badly?</strong> Check the root span's status and <C>error.type</C>.</li>
      <li><strong>Which span took the time?</strong> Long tool spans point to your API. Long model spans point to a large prompt or throttling.</li>
      <li><strong>Did it call the right tool with the right arguments?</strong> Check <C>gen_ai.tool.call.arguments</C>, which needs content recording on.</li>
      <li><strong>Did it use the tool's result?</strong> Compare the tool result with the final answer.</li>
      <li><strong>Is this a pattern?</strong> Use cluster analysis on evaluation results, or Insights (preview), to find recurring failures rather than fixing one-offs.</li>
    </OL>
  </>
);

const Setup = () => (
  <>
    <H2>Start with server-side tracing</H2>
    <P>This is Microsoft's recommended starting point. Once Application Insights is connected, Foundry traces prompt agents, hosted agents and workflows with <strong>no code changes</strong>.</P>
    <OL>
      <li>In the Foundry portal, open your project and select <strong>Agents</strong>, then <strong>Traces</strong>.</li>
      <li>Select <strong>Connect</strong>, then choose or create an Application Insights resource. The alternative path is <strong>Manage &gt; Project details &gt; Connected resources &gt; Add connection</strong>.</li>
      <li>Give readers the <strong>Log Analytics Reader</strong> role on the connected resource. If the tables are protected, also assign <strong>Privileged Monitoring Data Reader</strong>.</li>
      <li>Run the agent once, then check <strong>Traces</strong>. New traces typically take 2 to 5 minutes to appear.</li>
    </OL>
    <H2>Add client-side tracing for your own code</H2>
    <P>Server-side tracing can't see logic in your application around the agent call. Client-side instrumentation covers that gap and joins up with the server-side spans.</P>
    <Code title="Install" code={`pip install azure-ai-projects opentelemetry-sdk azure-core-tracing-opentelemetry azure-monitor-opentelemetry`} />
    <Code title="Python: send your app's spans to the project's Application Insights" code={`
import os

# Must be set BEFORE instrumenting, or no GenAI spans are produced
os.environ["AZURE_EXPERIMENTAL_ENABLE_GENAI_TRACING"] = "true"

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace

with (
    DefaultAzureCredential() as credential,
    AIProjectClient(endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"], credential=credential) as project,
):
    # The project can give you the connection string of its Application Insights
    connection_string = project.telemetry.get_application_insights_connection_string()
    configure_azure_monitor(connection_string=connection_string)

    tracer = trace.get_tracer(__name__)
    with tracer.start_as_current_span("contoso-support-request"):
        with project.get_openai_client(agent_name="contoso-support") as openai:
            response = openai.responses.create(input="Where is order A1042?")
            print(response.output_text)
`} />
    <Code title="Python: trace your own function" code={`
from azure.ai.projects.telemetry import trace_function

@trace_function("lookup-order")
def lookup_order(order_id: str) -> str:
    return '{"status": "shipped"}'

# Parameters and the return value are ALWAYS recorded with this decorator,
# even when content recording is off. Don't pass secrets through it.
`} />
    <H2>Switches to know</H2>
    <Table head={['Environment variable', 'Default', 'Effect']} rows={[
      [<C>AZURE_EXPERIMENTAL_ENABLE_GENAI_TRACING</C>, 'false', 'Turns on GenAI tracing. Without it, no spans'],
      [<C>OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT</C>, 'false', 'Records messages and tool arguments. May contain personal data'],
      [<C>AZURE_TRACING_GEN_AI_ENABLE_TRACE_CONTEXT_PROPAGATION</C>, 'true when tracing is on', 'Sends W3C trace headers so client and server spans join up'],
      [<C>AZURE_TRACING_GEN_AI_TRACE_CONTEXT_PROPAGATION_INCLUDE_BAGGAGE</C>, 'false', 'Also sends the baggage header, which can carry user data'],
      [<C>AZURE_TRACING_GEN_AI_INCLUDE_BINARY_DATA</C>, 'false', 'Puts image and file data in spans, which can make them much larger'],
      [<C>OTEL_SERVICE_NAME</C>, 'not set', 'Names your app, so you can tell apps apart in a shared resource'],
    ]} />
    <Callout kind="trap" title="Common trap: content recording in production">
      Content recording captures user messages, tool arguments and model output. Leave it off in production unless your compliance rules allow it, and redact personal data before it reaches telemetry.
    </Callout>
    <H3>Other places to send or view traces</H3>
    <Grid>
      <Card title="Local development">The Foundry Toolkit for VS Code collects traces locally without Application Insights. You can also use the console exporter or Aspire Dashboard over OTLP.</Card>
      <Card title="Agents running elsewhere">Instrument with OpenTelemetry, send to the same Application Insights, and set <C>gen_ai.agent.id</C> on each span so Foundry can attribute it (preview).</Card>
    </Grid>
  </>
);

const Monitor = () => (
  <>
    <H2>The Agent Monitoring Dashboard</H2>
    <P>Open it from <strong>Build</strong>, select the agent, then the <strong>Monitor</strong> tab. It reads from the connected Application Insights resource.</P>
    <Table head={['Metric', 'What to watch for']} rows={[
      ['Token usage', 'High counts can mean verbose prompts or responses worth trimming'],
      ['Latency', 'Above 10 seconds can indicate model throttling, complex tool calls or network problems'],
      ['Run success rate', 'Below 95% is worth investigating'],
      ['Evaluation metrics', 'Scores from evaluators on sampled output. Read each one against its own scale'],
      ['Red teaming results', 'A failed scan points to potential security risk that needs fixing'],
    ]} />
    <H2>Map each monitoring goal to a feature</H2>
    <Table head={['Exam skill', 'Use']} rows={[
      ['Token analytics', 'Dashboard token charts, or KQL over gen_ai.usage.* attributes'],
      ['Latency breakdown', 'Span durations within a trace, or percentiles in KQL'],
      ['Model performance and capacity', 'Azure Monitor platform metrics. For PTU, Provisioned-Managed Utilization V2'],
      ['Drift or regression over time', 'A scheduled evaluation against the same golden dataset, compared run to run'],
      ['Live quality and grounding', 'Continuous evaluation on sampled traffic with Groundedness and Relevance'],
      ['Safety events', 'Safety evaluators, guardrail annotations, red team scans and alerts'],
      ['Search index health', 'Azure AI Search metrics and indexer status. See the AI Search page'],
    ]} />
    <H2>Query it yourself with KQL</H2>
    <P>GenAI spans appear in the <C>dependencies</C> table, with the <C>gen_ai.*</C> keys inside <C>customDimensions</C> rather than in their own columns.</P>
    <Code title="KQL: see recent agent spans" code={`
dependencies
| where timestamp > ago(1h)
| where customDimensions has "gen_ai.agent.name"
| project timestamp, name, duration, success, customDimensions
| take 20
`} />
    <Code title="KQL: tokens and p95 latency per agent and operation" code={`
dependencies
| where timestamp > ago(24h)
| where customDimensions has "gen_ai.operation.name"
| extend agent = tostring(customDimensions["gen_ai.agent.name"]),
         operation = tostring(customDimensions["gen_ai.operation.name"]),
         inputTokens = toint(customDimensions["gen_ai.usage.input_tokens"]),
         outputTokens = toint(customDimensions["gen_ai.usage.output_tokens"])
| summarize calls = count(),
            input_tokens = sum(inputTokens),
            output_tokens = sum(outputTokens),
            p95_ms = percentile(duration, 95),
            failures = countif(success == false)
          by agent, operation
| order by input_tokens desc
`} />
    <Callout kind="note">
      The second query is built from Microsoft's documented field names but hasn't been run against a live resource, so test it on your own data. If several apps share the resource, filter on <C>cloud_RoleName</C>.
    </Callout>
    <H2>Retention and cost</H2>
    <UL>
      <li>The Foundry <strong>Traces</strong> view searches ingested traces from the last 90 days.</li>
      <li>Retention and billing follow your Application Insights and Log Analytics configuration.</li>
      <li>Treat trace data as production telemetry, with the same access controls as other logs.</li>
    </UL>
  </>
);

const Troubleshoot = () => (
  <>
    <H2>Symptom to fix</H2>
    <Table head={['Symptom', 'Likely cause', 'Fix']} rows={[
      ['No traces in the portal', 'Application Insights not connected, no recent traffic, or ingestion delay', 'Confirm the connection, generate traffic, refresh after 2 to 5 minutes'],
      ['Authorization errors viewing telemetry', 'Missing role on Application Insights or Log Analytics', 'Assign Log Analytics Reader. Add Privileged Monitoring Data Reader for protected tables'],
      ['Client-side tracing produces no spans', <>The opt-in variable wasn't set before instrumenting</>, <>Set <C>AZURE_EXPERIMENTAL_ENABLE_GENAI_TRACING=true</C> before <C>AIProjectInstrumentor().instrument()</C></>],
      ['Spans appear but message content is missing', 'Content recording is off, which is the default', <>Set <C>OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true</C> in development</>],
      ['Client and server spans not joined up', 'Trace context not propagated', <>Enable propagation, and get the OpenAI client from <C>get_openai_client()</C> after instrumenting</>],
      ['Sensitive data in traces', 'Content recording on, or data in prompts or arguments', 'Disable content recording in production and redact first'],
      ['LangChain or LangGraph spans missing', 'Distro not initialised or instrumentation not enabled', <>Call <C>use_microsoft_opentelemetry(...)</C> with LangChain enabled before running the agent</>],
    ]} />
    <Callout kind="exam">
      Scenario questions often describe a symptom like this. Spot the keyword first: "can't see traces" points to the connection or delay, "not authorized" points to a role, and "spans but no content" points to content recording.
    </Callout>
  </>
);

export default function Telemetry() {
  return (
    <ModulePage id="telemetry"
      intro="How Foundry records what your agent does, where that data goes, and how you use it to debug, monitor and control cost."
      tabs={[
        { id: 'overview', label: 'How it works', content: <BigPicture /> },
        { id: 'explore', label: 'Explore a trace', content: <Explore /> },
        { id: 'setup', label: 'Set up tracing', content: <Setup /> },
        { id: 'monitor', label: 'Monitor & query', content: <Monitor /> },
        { id: 'fix', label: 'Troubleshoot', content: <Troubleshoot /> },
      ]}
      sources={[
        ['Observability in generative AI', 'https://learn.microsoft.com/azure/foundry/concepts/observability'],
        ['Agent tracing overview', 'https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept'],
        ['Set up tracing in Microsoft Foundry', 'https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup'],
        ['Add client-side tracing to Foundry agents', 'https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-client-side'],
        ['Configure tracing for AI agent frameworks', 'https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-framework'],
        ['Monitor agents with the Agent Monitoring Dashboard', 'https://learn.microsoft.com/azure/foundry/observability/how-to/how-to-monitor-agents-dashboard'],
        ['Register external agents for observability', 'https://learn.microsoft.com/azure/foundry/agents/how-to/register-external-agent'],
        ['Monitor AI agents with Application Insights', 'https://learn.microsoft.com/azure/azure-monitor/app/agents-view'],
        ['Monitor a multi-agent app with OpenTelemetry (query and field names)', 'https://learn.microsoft.com/azure/app-service/tutorial-ai-agent-monitoring-dotnet'],
      ]} />
  );
}
