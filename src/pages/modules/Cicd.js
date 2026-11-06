import ModulePage from '../../components/ModulePage';
import { C, Callout, Card, Code, Flow, Grid, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Pipeline = () => (
  <>
    <H2>The agent development lifecycle</H2>
    <Flow steps={[
      { title: 'Create', sub: 'Portal, SDK or azd' },
      { title: 'Test', sub: 'Playground or local' },
      { title: 'Trace', sub: 'Inspect every step' },
      { title: 'Evaluate', sub: 'Catch regressions' },
      { title: 'Publish', sub: 'Stable endpoint' },
      { title: 'Monitor', sub: 'Dashboards, alerts' },
    ]} />
    <H2>Infrastructure as code</H2>
    <Grid>
      <Card title="Azure resources"><strong>Bicep or Terraform</strong> for the Foundry resource, project, connections, networking and bring-your-own resources. Sample templates are in the <C>foundry-samples</C> repository.</Card>
      <Card title="Agent versions"><strong>azd</strong> or the SDK. Keep a prompt agent's definition in source control, or deploy hosted agent code. Choosing Terraform for infrastructure doesn't put agent versions under Terraform.</Card>
    </Grid>
    <H2>Set up a pipeline with azd</H2>
    <Code title="azd" code={`
azd pipeline config      # detects GitHub or Azure DevOps, creates the identity,
                         # sets repository variables and generates the workflow

# What the generated workflow runs on a push to main:
azd provision            # create or update infrastructure
azd deploy               # create a new hosted agent version
`} />
    <Code title="GitHub Actions: the shape of a release job (sketch)" code={`
permissions:
  id-token: write        # lets the workflow get an OIDC token, so no stored secret
  contents: read

steps:
  - uses: actions/checkout@v4
  - uses: azure/login@v2
    with:
      client-id: \${{ vars.AZURE_CLIENT_ID }}
      tenant-id: \${{ vars.AZURE_TENANT_ID }}
      subscription-id: \${{ vars.AZURE_SUBSCRIPTION_ID }}
  # 1. Deploy to the test environment
  # 2. Smoke test: invoke the agent, expect a non-empty answer
  # 3. Evaluation gate: fail the job if required metrics regress
  # 4. Deploy to production and shift traffic gradually
`} />
    <Callout kind="exam">
      Sign in from pipelines with <strong>OpenID Connect (OIDC) federated credentials</strong>, not a stored client secret. Non-secret values like subscription ID and project endpoint go in repository <em>variables</em>.
    </Callout>
    <H3>Pipeline identity permissions</H3>
    <UL>
      <li><strong>Code deployment:</strong> Foundry User and Contributor on the target project.</li>
      <li><strong>Container deployment:</strong> also needs rights to build and push the image and to reach related resources.</li>
    </UL>
  </>
);

const Gates = () => (
  <>
    <H2>Evaluation as a quality gate</H2>
    <P>Tests that pass or fail on exact strings don't suit generative output. Instead, run evaluators against a fixed dataset and compare the scores.</P>
    <OL>
      <li>Provide a <strong>dataset of test queries</strong> and a <strong>list of evaluators</strong>.</li>
      <li>The action or task invokes your agent, runs the evaluators and writes a summary report.</li>
      <li>Results include <strong>confidence intervals and significance tests</strong>, so you can tell a real change from random variation.</li>
      <li>Fail the pipeline if a required metric regresses.</li>
    </OL>
    <Table head={['Platform', 'What to use', 'Status']} rows={[
      ['GitHub Actions', <C>microsoft/ai-agent-evals</C>, 'Preview'],
      ['Azure DevOps', 'AI Agent Evaluation marketplace extension', 'Preview'],
      ['Command line', 'azd agent evaluation commands', 'See the docs'],
    ]} />
    <Callout kind="trap" title="Common trap: results that can't be compared">
      Pin the dataset, model deployments and evaluator versions. If the judge model or the test data changes between runs, you can't tell whether the agent actually got better or worse.
    </Callout>
    <H2>Promote to production gradually</H2>
    <OL>
      <li>Deploy the same source to dev, then test, then production.</li>
      <li>Validate in test, including evaluation and a smoke test.</li>
      <li>Deploy to production and <strong>gradually increase the new version's share of traffic</strong>.</li>
      <li>If a problem appears, <strong>route traffic back to the previous version</strong>. Keep it available for rollback.</li>
    </OL>
    <H3>Keeping deployments safe</H3>
    <UL>
      <li>Use one Foundry project per environment.</li>
      <li>Reference agents as <C>name:version</C>, so an environment always runs a known version.</li>
      <li>Serialize releases across every tool that can deploy the same agent. A GitHub concurrency group doesn't lock other tools out.</li>
      <li>Terraform state can contain sensitive values, so keep it in secured remote storage.</li>
      <li>A deployment doesn't replace a smoke test. Always invoke the agent after deploying.</li>
    </UL>
    <H2>Common choices</H2>
    <Table head={['Goal', 'Use']} rows={[
      ['One command to provision and deploy locally', <C>azd up</C>],
      ['Application-only release on unchanged infrastructure', <C>azd deploy</C>],
      ['Generate CI/CD for a repository', <C>azd pipeline config</C>],
      ['Run a hosted agent locally', <><C>azd ai agent run</C>, then <C>azd ai agent invoke --local</C></>],
      ['Stop bad versions reaching users', 'Evaluation gate before promotion'],
      ['Catch quality problems after release', 'Continuous evaluation and alerts'],
    ]} />
  </>
);

export default function Cicd() {
  return (
    <ModulePage id="cicd"
      intro="Deploy Foundry resources and agents through a pipeline, with evaluation gates and a safe route back when a release goes wrong."
      tabs={[
        { id: 'pipeline', label: 'Pipelines', content: <Pipeline /> },
        { id: 'gates', label: 'Gates & rollout', content: <Gates /> },
      ]}
      sources={[
        ['Agent development lifecycle', 'https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle'],
        ['Set up CI/CD for hosted agents with azd', 'https://learn.microsoft.com/azure/foundry/agents/how-to/set-up-ci-cd-cli'],
        ['Quickstart: Hosted agent CI/CD templates', 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/set-up-cicd-hosted-agent'],
        ['Promote hosted agents to production', 'https://learn.microsoft.com/azure/foundry/agents/how-to/deploy-hosted-agent-production'],
        ['Deploy a hosted agent with Terraform', 'https://learn.microsoft.com/azure/foundry/agents/how-to/deploy-hosted-agent-terraform'],
        ['Run an evaluation in GitHub Actions', 'https://learn.microsoft.com/azure/foundry/how-to/evaluation-github-action'],
        ['Run an evaluation in Azure DevOps', 'https://learn.microsoft.com/azure/foundry/how-to/evaluation-azure-devops'],
      ]} />
  );
}
