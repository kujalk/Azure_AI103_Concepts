import { useState } from 'react';
import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, H2, H3, OL, P, Panel, Table, UL } from '../../components/ui';

const Types = () => (
  <>
    <H2>Three questions decide the type</H2>
    <UL>
      <li><strong>Where may data be processed?</strong> Global, data zone or Azure geography.</li>
      <li><strong>How do you pay?</strong> Per token, reserved capacity, or discounted batch.</li>
      <li><strong>How much latency variance can you accept?</strong> Provisioned has less.</li>
    </UL>
    <Table head={['Type', 'SKU', 'Inference data processed', 'Billing', 'Best for']} rows={[
      ['Global Standard', <C>GlobalStandard</C>, 'Any Azure region', 'Per token', 'The default: newest models, highest quota'],
      ['Global Provisioned', <C>GlobalProvisionedManaged</C>, 'Any Azure region', 'Reserved PTU', 'Predictable high throughput'],
      ['Global Batch', <C>GlobalBatch</C>, 'Any Azure region', '50% discount, 24-hour target', 'Large async jobs'],
      ['Data Zone Standard', <C>DataZoneStandard</C>, 'Within the data zone', 'Per token', 'EU, US or APAC compliance'],
      ['Data Zone Provisioned', <C>DataZoneProvisionedManaged</C>, 'Within the data zone', 'Reserved PTU', 'Data zone plus predictable throughput'],
      ['Data Zone Batch', <C>DataZoneBatch</C>, 'Within the data zone', '50% discount', 'Large async jobs in a data zone'],
      ['Standard', <C>Standard</C>, 'Within the Azure geography', 'Per token', 'Geography compliance, low-to-medium volume'],
      ['Regional Provisioned', <C>ProvisionedManaged</C>, 'Within the Azure geography', 'Reserved PTU', 'Geography compliance plus throughput'],
      ['Developer', <C>DeveloperTier</C>, 'Any Azure region', 'Per token', 'Evaluating a fine-tuned model only'],
    ]} />
    <Callout kind="trap" title="Common trap: data at rest vs inference">
      Data at rest stays in your chosen Azure geography for every deployment type. The Global, Data Zone or regional choice controls where <em>inference</em> happens. A question that says prompts must stay in the EU rules out Global, even if the resource is in an EU region.
    </Callout>
    <Callout kind="trap" title="Common trap: batch and geography">
      There's no single-geography batch type. If a job needs batch pricing and in-region processing, the closest choice is Data Zone Batch, where a data zone is acceptable.
    </Callout>
    <H3>Other options</H3>
    <UL>
      <li><strong>Managed compute</strong> runs open or custom models on Azure VMs. These deployment types don't apply to it.</li>
      <li><strong>Instant access (preview)</strong> lets you call supported models by name with no deployment, which is handy for trying a model.</li>
      <li><strong>Priority processing</strong> gives faster responses on a pay-as-you-go basis for supported types.</li>
      <li><strong>Developer</strong> deployments delete themselves after 24 hours and have no SLA or residency guarantee.</li>
    </UL>
    <H2>Provisioned throughput units (PTUs)</H2>
    <UL>
      <li>You reserve capacity measured in PTUs. Each model and version needs a different PTU minimum and delivers different throughput per PTU.</li>
      <li>Provisioned gives low latency variance at high, consistent volume.</li>
      <li>Past 100% utilization, the service returns a fast 429 rather than slowing down, until utilization drops below 100%.</li>
      <li>Watch the <strong>Provisioned-Managed Utilization V2</strong> metric in Azure Monitor.</li>
      <li>On a 429, redirect traffic to another deployment for the lowest latency, or retry client-side to get the most throughput per PTU.</li>
    </UL>
  </>
);

const RpmCalculator = () => {
  const [rpm, setRpm] = useState(600);
  const perSecond = rpm / 60;
  return (
    <Panel title="Why bursts get throttled">
      <label htmlFor="rpm" className="text-sm font-semibold text-slate-900">Deployment limit: {rpm.toLocaleString()} RPM</label>
      <input id="rpm" type="range" min="60" max="6000" step="60" value={rpm} onChange={e => setRpm(Number(e.target.value))} className="mt-2 block w-full accent-azure-500" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-100 p-3 text-sm"><div className="text-slate-600">Allowed in a 1-second window</div><div className="text-xl font-bold text-slate-900">{perSecond.toLocaleString()} requests</div></div>
        <div className="rounded-lg bg-slate-100 p-3 text-sm"><div className="text-slate-600">Allowed in a 10-second window</div><div className="text-xl font-bold text-slate-900">{(perSecond * 10).toLocaleString()} requests</div></div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">Sending {(perSecond * 2).toLocaleString()} requests in one second gets a 429 if the service is evaluating 1-second windows, even if you then send nothing for the rest of the minute. Limits are checked over short windows, typically 1 or 10 seconds.</p>
    </Panel>
  );
};

const Limits = () => (
  <>
    <H2>How quota and rate limits work</H2>
    <P>Quota is granted in tokens per minute (TPM) per subscription, region and model. Assigning TPM to a deployment sets both its TPM and its requests-per-minute (RPM) limit, so you can split quota across deployments.</P>
    <UL>
      <li><strong>TPM</strong> counts actual input and generated tokens. A high maximum-output setting doesn't reserve tokens against it.</li>
      <li><strong>RPM</strong> expects evenly spread requests and is checked over short windows.</li>
      <li><strong>Failed requests still count</strong> toward your limit, so retrying without backoff makes things worse.</li>
    </UL>
    <RpmCalculator />
    <H2>Not every 429 is the same</H2>
    <Table head={['Error message says', 'Root cause', 'Do this']} rows={[
      ['"Rate limit is exceeded" or "Requests to … have been limited"', 'You passed the deployment\'s TPM or RPM', 'Raise its TPM, rebalance quota, or request an increase'],
      ['"Temporarily unable to process" or "high demand"', 'Backend capacity is constrained, often briefly', <>Retry after <C>retry-after-ms</C>. If it persists, consider PTU</>],
      [<>Your quota is unchanged, but <C>x-ratelimit-limit-tokens</C> is below your TPM</>, 'Temporary reduction to protect the shared pool', 'Back off and retry. It typically resolves within hours. Consider PTU for consistency'],
    ]} />
    <Callout kind="exam">
      Requesting more quota is the wrong answer when the 429 comes from capacity pressure. Read the error message and headers first. Microsoft specifically warns that customers often confuse the two.
    </Callout>
    <H3>Why you can see 429s when metrics look fine</H3>
    <UL>
      <li>Token usage metrics show billed tokens from <em>successful</em> requests, so rejected requests aren't in them.</li>
      <li>A short burst can trip RPM while the per-minute total looks fine.</li>
      <li>Quota may be approved at subscription level but not allocated to this deployment.</li>
    </UL>
    <H2>Handle throttling in code</H2>
    <Code title="Response headers" code={`
x-ratelimit-limit-tokens: 150000      # your effective limit right now
x-ratelimit-remaining-tokens: 149984  # slow down before this reaches zero
x-ratelimit-remaining-requests: 59
retry-after-ms: 2000                  # on a 429: how long to wait
`} />
    <Code title="Python: built-in retry is usually enough" code={`
from openai import OpenAI

# The SDK backs off exponentially with jitter and honours retry-after headers
client = OpenAI(base_url="https://<resource>.openai.azure.com/openai/v1/", api_key=token, max_retries=5)

# Using tenacity instead? Set max_retries=0, or each attempt multiplies into extra requests.
`} />
    <H2>Reduce rate-limit and cost pressure</H2>
    <OL>
      <li>Shorten prompts and limit output to what the scenario needs.</li>
      <li>Move anything not time-sensitive to Batch for a 50% discount and a separate quota.</li>
      <li>Ramp traffic up gradually rather than in sharp spikes.</li>
      <li>Use a smaller model or model router for simple prompts.</li>
      <li>Rebalance TPM from quiet deployments to busy ones.</li>
      <li>Spread traffic across deployments or regions for higher throughput.</li>
      <li>For central limits across many apps, use AI Gateway, which uses Azure API Management to apply token limits and quotas.</li>
    </OL>
    <H3>Costs that aren't model tokens</H3>
    <UL>
      <li>Hosted agents add container compute on top of inference and tools.</li>
      <li>Web search incurs its own Grounding with Bing charges.</li>
      <li>Application Insights bills for trace volume and retention.</li>
      <li>Standard agent setup uses your own Cosmos DB, with containers needing at least 1000 RU/s each.</li>
    </UL>
  </>
);

export default function DeploymentsQuotas() {
  return (
    <ModulePage id="deployments-quotas"
      intro="Choose how a model is hosted and billed, then keep it within its limits without guessing at the cause when requests get throttled."
      tabs={[
        { id: 'types', label: 'Deployment types', content: <Types /> },
        { id: 'limits', label: 'Quotas & 429s', content: <Limits /> },
      ]}
      sources={[
        ['Deployment types for Foundry Models', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types'],
        ['Manage quota for Foundry Models', 'https://learn.microsoft.com/azure/foundry/openai/how-to/quota'],
        ['What is provisioned throughput?', 'https://learn.microsoft.com/azure/foundry/openai/concepts/provisioned-throughput'],
        ['Configure AI Gateway in your Foundry resources', 'https://learn.microsoft.com/azure/foundry/configuration/enable-ai-api-management-gateway-portal'],
        ['Agents in Microsoft Foundry (cost model)', 'https://learn.microsoft.com/azure/foundry/agents/overview'],
        ['Use your own resources', 'https://learn.microsoft.com/azure/foundry/agents/how-to/use-your-own-resources'],
      ]} />
  );
}
