import ModulePage from '../../components/ModulePage';
import { C, Callout, Card, Code, Flow, Grid, H2, H3, OL, P, Table, UL } from '../../components/ui';
import ModelPicker from '../../interactive/ModelPicker';

const Framework = () => (
  <>
    <H2>Choose in this order</H2>
    <P>Don't start from "which model is best". Start with what the job requires, because hard requirements remove most of the catalog before quality or price matter.</P>
    <Flow steps={[
      { title: '1. Hard needs', sub: 'Tool calling, input types, region, context size' },
      { title: '2. Shortlist', sub: 'Catalog filters and the leaderboard' },
      { title: '3. Trade-offs', sub: 'Quality, safety, cost, throughput' },
      { title: '4. Your data', sub: 'Evaluate candidates on your own test set' },
      { title: '5. Deploy', sub: 'Pick the deployment type' },
    ]} />
    <H2>The model families</H2>
    <Table head={['Family', 'Reach for it when', 'Examples in the catalog']} rows={[
      ['Large language model (LLM)', 'Complex reasoning, sophisticated tool orchestration, nuanced judgment', <>gpt-5.5, o-series, MAI-Thinking-1, Mistral-Large-3</>],
      ['Small language model (SLM)', 'High volume of simpler prompts where cost and latency matter most', <>gpt-5-mini, gpt-5-nano, Phi-4-mini-instruct, Mistral-small-2503</>],
      ['Multimodal', 'Input includes images or audio as well as text', <>gpt-4o, Mistral-Large-3, Phi-4-multimodal-instruct</>],
      ['Code', 'Generating or completing code', <>codex-mini, Codestral-2501, Kimi-K2.7-Code</>],
      ['Embeddings', 'Turning text into vectors for search', 'Embedding models in the Azure OpenAI collection'],
      ['Image, video, audio', 'Producing media, or speech in and out', 'gpt-image family, sora-2, gpt-realtime'],
      ['Foundry Tools', 'Well-defined tasks a prebuilt service already does', 'Azure Language, Translator, Speech, Content Understanding'],
    ]} />
    <Callout kind="trap" title="Common trap: small does not mean agent-ready">
      Microsoft's catalog lists <C>Phi-4-mini-instruct</C> and <C>Codestral-2501</C> with <strong>tool calling: No</strong>, while <C>Mistral-small-2503</C> has it. A model that can't call tools can't drive an agent that needs function calling. Always check capabilities before comparing price.
    </Callout>
    <H2>Tools in the Foundry portal</H2>
    <Grid cols={3}>
      <Card title="Catalog filters">Collection, region, deployment option and SKU, lifecycle (preview, GA, deprecated), supported features such as reasoning and tool calling, and inference task.</Card>
      <Card title="Leaderboards (preview)">Rank models on quality, safety, estimated cost and throughput. Scenario leaderboards cover areas such as coding or math. Trade-off charts plot two metrics against each other.</Card>
      <Card title="Model card">Quick facts, details, existing deployments, benchmarks and license. Not every model has a Benchmarks tab.</Card>
    </Grid>
    <H3>How to read a leaderboard</H3>
    <UL>
      <li><strong>Quality index:</strong> higher is better across reasoning, coding, math and knowledge tasks.</li>
      <li><strong>Safety:</strong> a lower attack success rate means a more robust model.</li>
      <li><strong>Estimated cost:</strong> assumes a 3:1 input-to-output token ratio, so adjust for your own workload.</li>
      <li><strong>Public data only:</strong> benchmarks use public datasets. They shortlist candidates; they don't prove a model works for you.</li>
    </UL>
    <Callout kind="exam">
      If a question asks how to confirm a model is right <em>for your scenario</em>, the answer is to <strong>evaluate on your own data</strong>. The leaderboard is how you build the shortlist, not how you finish the decision.
    </Callout>
    <H2>Where the model comes from</H2>
    <Table head={['', 'Foundry Models sold by Azure', 'Foundry Models from partners and community']} rows={[
      ['Includes', 'All Azure OpenAI models and selected models from top providers', 'Other models in the catalog from partners and the community'],
      ['Billing and support', 'Billed through your Azure subscription, covered by Azure SLAs, supported by Microsoft', 'Provider terms apply; check the model card'],
      ['Guardrail system', 'Applies (except audio transcription prompts and completions)', 'Check the model and deployment option'],
    ]} />
  </>
);

const UseCase = () => (
  <>
    <H2>Scenario: Contoso Outdoors support agent</H2>
    <P>Contoso Outdoors wants a text agent that answers order and returns questions. Here's how each requirement narrows the choice.</P>
    <Table head={['Requirement', 'What it means for the model or deployment']} rows={[
      ['Look up live orders through an internal API', 'Tool calling is mandatory, and the model must work with Agent Service'],
      ['Answer from a returns policy document', 'Grounding is a tool (file search), so it does not change the model family'],
      ['Most questions are simple, like "where is my order?"', 'A small model should cope, which keeps cost and latency down'],
      ['A few questions are harder, like damaged goods across several orders', 'Prompt difficulty is mixed, so model router is worth testing'],
      ['Customers are in the EU and data must stay in the EU', 'Use a Data Zone deployment in the EU zone, not Global'],
      ['Traffic spikes during sales', 'Pay-per-token handles bursts, so start with Standard rather than PTU'],
    ]} />
    <H2>The decision, step by step</H2>
    <OL>
      <li><strong>Remove what can't work.</strong> Filter the catalog to models with tool calling that Agent Service supports. Phi-4-mini-instruct drops out here.</li>
      <li><strong>Check where it can run.</strong> Keep only models offered as Data Zone Standard in an EU region. Global-only models drop out, however good their scores.</li>
      <li><strong>Build a three-way test.</strong> Compare a small model such as gpt-5-mini, a frontier model as the quality baseline, and model router in Balanced mode.</li>
      <li><strong>Write a test set from real questions.</strong> Include easy, hard and policy questions, each with the tool call you expect.</li>
      <li><strong>Evaluate all three the same way.</strong> Use Task Adherence, Tool Call Accuracy, Groundedness and a safety evaluator, and record cost and latency.</li>
      <li><strong>Pick the cheapest option that meets your quality bar.</strong> Don't choose on the highest score alone.</li>
    </OL>
    <H2>How to read the results</H2>
    <Table head={['If the evaluation shows', 'Then']} rows={[
      ['The small model passes on easy and hard questions', 'Use it. Simple, cheap, and the same model on every request'],
      ['The small model fails only on hard questions', 'Use model router, or send hard categories to a stronger model'],
      ['Every model fails on policy questions', 'The model probably isn\'t the problem. Check retrieval and instructions first'],
      ['Audit rules require the same model on every request', 'Use a direct deployment. Router may choose different models per prompt'],
    ]} />
    <H2>Build it</H2>
    <P>The model is one line of the agent definition, so you can swap candidates without rewriting the agent. Pass the name of your deployment.</P>
    <Code title="Python: create the agent with your chosen deployment" code={`
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, FileSearchTool

project = AIProjectClient(
    endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
    credential=DefaultAzureCredential(),
)

agent = project.agents.create_version(
    agent_name="contoso-support",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",   # your deployment name: the only line that changes per candidate
        instructions=(
            "You help Contoso Outdoors customers with orders and returns. "
            "Answer policy questions only from the returns policy."
        ),
        tools=[FileSearchTool(vector_store_ids=["<vector-store-id>"])],
    ),
)
print(agent.name, agent.version)
`} />
    <P>The order lookup would be added as a function tool. The <a className="text-azure-600 underline" href="#/agent-tools">Agent Tools</a> page shows how.</P>
  </>
);

const Router = () => (
  <>
    <H2>What model router is</H2>
    <P>Model router is a trained model that you deploy like any other. For each request it analyses the system message, user message, tool definitions and history, then forwards the prompt to the most suitable model in its pool. It isn't an LLM itself.</P>
    <Table head={['Routing mode', 'Behaviour', 'Good for']} rows={[
      ['Balanced (default)', 'Best combination of quality and cost', 'Where most workloads should start'],
      ['Cost', 'Strongly favours cheaper models, accepting slightly lower quality on complex prompts', 'Latency-insensitive batch pipelines'],
      ['Quality', 'Always picks the highest-quality model for the prompt, regardless of cost', 'Critical reasoning tasks'],
    ]} />
    <H2>Facts worth memorising</H2>
    <UL>
      <li>You <strong>don't deploy the underlying LLMs separately</strong>. The exception is Claude models, which you must deploy first and then include.</li>
      <li>The <C>model</C> field in every response shows which model handled that request. Log it, because it's your main observability signal.</li>
      <li>Use a <strong>model subset</strong> as a compliance gate, so new models don't appear without explicit opt-in.</li>
      <li>Select <strong>at least two models</strong>. A single-model subset removes routing savings and automatic failover.</li>
      <li>If prompts exceed the smallest model's context window, use a subset that only includes large-enough models.</li>
      <li>See the traffic split in Azure Monitor: <strong>Monitoring &gt; Metrics</strong>, filter to the router deployment, split by underlying model.</li>
      <li>Router honours data-zone boundaries and doesn't store prompts.</li>
    </UL>
    <Callout kind="preview" title="Preview: session affinity">
      Each Chat Completions turn can otherwise land on a different model. Session affinity (preview) tries to keep a session ID on the same model. The association expires after 30 minutes without a successful create or update, and it never overrides policy, safety, quota or fallback rules.
    </Callout>
    <H2>Router or direct deployment?</H2>
    <Table head={['Choose', 'When']} rows={[
      ['Model router', 'Prompts vary in difficulty, you want one endpoint and rate limit, built-in failover, or simpler model lifecycle management'],
      ['Direct deployment', 'You need the same model on every request, such as for compliance or parameter-sensitive work'],
      ['Both', 'Router as the default path, with direct deployments for specialised or compliance-mandated workloads. Microsoft calls this the hybrid pattern'],
    ]} />
    <Callout kind="trap">
      Router doesn't remove the need to evaluate. Compare it with a baseline, and re-evaluate whenever you change the routing mode or model subset. Change one lever at a time so you can tell what caused any difference.
    </Callout>
    <Code title="Python: call router and record which model answered" code={`
openai = project.get_openai_client()

response = openai.responses.create(
    model="my-model-router",   # the name of your router deployment
    input="Which of my last three orders can still be returned?",
)
print(response.output_text)
print("Handled by:", response.model)   # log this for your dashboards
`} />
  </>
);

export default function ModelSelection() {
  return (
    <ModulePage id="model-selection"
      intro="How to choose the right model for a task, and how to prove the choice on your own data, using a simple support agent as the worked example."
      tabs={[
        { id: 'framework', label: 'How to choose', content: <Framework /> },
        { id: 'usecase', label: 'Worked use case', content: <UseCase /> },
        { id: 'picker', label: 'Try the picker', content: <ModelPicker /> },
        { id: 'router', label: 'Model router', content: <Router /> },
      ]}
      sources={[
        ['Overview of Microsoft Foundry Models', 'https://learn.microsoft.com/azure/foundry/concepts/foundry-models-overview'],
        ['Foundry Models sold by Azure', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure'],
        ['Foundry Models from partners and community', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/models-from-partners'],
        ['Compare models using the model leaderboard', 'https://learn.microsoft.com/azure/foundry/how-to/benchmark-model-in-catalog'],
        ['Model leaderboards in the Foundry portal', 'https://learn.microsoft.com/azure/foundry/concepts/model-benchmarks'],
        ['How model router works', 'https://learn.microsoft.com/azure/foundry/openai/concepts/model-router-how-it-works'],
        ['Use model router with Foundry agents', 'https://learn.microsoft.com/azure/foundry/openai/how-to/model-router-agents'],
        ['Deployment types for Foundry Models', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types'],
        ['Quickstart: Create a prompt agent', 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent'],
      ]} />
  );
}
