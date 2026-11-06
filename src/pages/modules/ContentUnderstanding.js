import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, Flow, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Basics = () => (
  <>
    <H2>What it does</H2>
    <P>Azure Content Understanding in Foundry Tools turns documents, images, audio and video into output you define: clean markdown for reasoning, and structured fields with confidence scores for automation.</P>
    <Flow steps={[
      { title: 'File', sub: 'Document, image, audio, video' },
      { title: 'Analyzer', sub: 'Prebuilt or custom' },
      { title: 'Content extraction', sub: 'OCR, layout, transcript' },
      { title: 'Field extraction', sub: 'Your schema' },
      { title: 'Result', sub: 'Markdown + JSON fields' },
    ]} />
    <H2>Analyzer categories</H2>
    <Table head={['Category', 'Examples', 'Use']} rows={[
      ['Content extraction', <><C>prebuilt-read</C>, <C>prebuilt-layout</C></>, 'OCR and layout. prebuilt-layout needs no language or embedding model'],
      ['Base', <><C>prebuilt-document</C>, <C>prebuilt-image</C>, <C>prebuilt-audio</C>, <C>prebuilt-video</C></>, 'The parent for a custom analyzer, set with baseAnalyzerId'],
      ['RAG', <><C>prebuilt-documentSearch</C>, <C>prebuilt-videoSearch</C></>, 'Markdown and semantic analysis, for search ingestion'],
      ['Domain-specific', 'Invoices, tax forms, IDs, mortgages, contracts', 'Ready-made fields for common documents'],
      ['Utility', 'Schema generation', 'Discovering document structure'],
    ]} />
    <H2>Three field methods</H2>
    <Table head={['Method', 'Does', 'Example']} rows={[
      [<C>extract</C>, 'Pulls a value that\'s in the content', 'Invoice date, line items'],
      [<C>classify</C>, 'Chooses from your categories', 'Sentiment of a call, expense type'],
      [<C>generate</C>, 'Produces something new from the content', 'A summary or chapter overview'],
    ]} />
    <H2>Output for downstream use</H2>
    <Table head={['Output', 'Feeds']} rows={[
      [<><C>markdown</C> field</>, 'RAG, agents and search. Keeps structure such as headings and tables'],
      [<><C>fields</C> in the JSON</>, 'Automation, databases and analytics'],
      ['Confidence scores', 'Deciding what needs human review'],
      ['Spans and source grounding', 'Tracing a value back to where it appears in the file'],
    ]} />
    <Callout kind="exam">
      <strong>Confidence and grounding are opt-in</strong>. Set <C>estimateFieldSourceAndConfidence: true</C> on the analyzer, or <C>estimateSourceAndConfidence: true</C> on one field. Send low-confidence results to a person, and let high-confidence, grounded results through.
    </Callout>
    <H3>Choosing between similar tools</H3>
    <Table head={['Tool', 'Best for']} rows={[
      ['Azure Document Intelligence', 'High-accuracy, deterministic extraction from structured documents'],
      ['Content Understanding', 'LLM-powered analysis of complex, unstructured and multimodal content'],
      ['A multimodal model directly', 'One-off, free-form questions, without a schema'],
    ]} />
  </>
);

const Build = () => (
  <>
    <H2>Build a custom analyzer</H2>
    <Code title="JSON: analyzer definition" code={`
{
  "description": "Extracts key fields from supplier invoices",
  "baseAnalyzerId": "prebuilt-document",
  "models": {
    "completion": "<completion-model>",
    "embedding": "<embedding-model>"
  },
  "config": {
    "estimateFieldSourceAndConfidence": true
  },
  "fieldSchema": {
    "fields": {
      "VendorName": { "type": "string", "method": "extract",
                      "description": "Name of the company issuing the invoice" },
      "Total":      { "type": "number", "method": "extract",
                      "description": "Final amount due, including tax" },
      "Category":   { "type": "string", "method": "classify",
                      "enum": ["Travel", "Equipment", "Services"],
                      "description": "Expense category" },
      "Summary":    { "type": "string", "method": "generate",
                      "description": "One sentence on what was purchased" }
    }
  }
}
`} />
    <Code title="REST: create the analyzer, then analyze and poll" code={`
# Create the analyzer
curl -i -X PUT "{endpoint}/contentunderstanding/analyzers/{analyzerId}?api-version=2025-11-01" \\
  -H "Ocp-Apim-Subscription-Key: {key}" -H "Content-Type: application/json" -d @analyzer.json

# The response has an Operation-Location header. Poll it until status is Succeeded.
curl -i -X GET "{operation-location}" -H "Ocp-Apim-Subscription-Key: {key}"
`} />
    <H3>Things to get right</H3>
    <UL>
      <li>Use API version <C>2025-11-01</C> for production. It's the GA version. <C>2026-06-01-preview</C> is for trying new features.</li>
      <li>Generative features use <strong>your own Foundry model deployment</strong>, and you pay standard token charges for it on top of content extraction.</li>
      <li>Good <strong>field descriptions</strong> are effectively the prompt, so make them specific.</li>
      <li>Improve accuracy further by labelling sample documents.</li>
      <li>Typed values, such as dates and numbers, are normalized automatically. You can't configure this.</li>
      <li>Analysis is asynchronous. The exception is the preview synchronous operations for small files with prebuilt-read and prebuilt-layout.</li>
    </UL>
    <H2>Tune document extraction</H2>
    <Table head={['Setting', 'Options', 'Choose']} rows={[
      [<C>extractionMode</C>, 'Layout-aware or faster text-only', 'Layout for tables and reading order, and text-only for clean markdown in simple RAG'],
      ['Categorization', 'Up to 200 categories in one analyzer', 'Classify files first, then route each to a specialised analyzer'],
      ['Add-ons', 'Layout elements, barcodes, figures', 'Enhanced extraction where you need it'],
    ]} />
    <H2>Using results in RAG and agents</H2>
    <OL>
      <li>Analyze files with a RAG analyzer such as <C>prebuilt-documentSearch</C>.</li>
      <li>Take the markdown and any fields you defined.</li>
      <li>Chunk the markdown, embed it, and push it to an Azure AI Search index, keeping the fields as metadata.</li>
      <li>Agents retrieve clean, structured content, and can cite its source.</li>
    </OL>
    <P>Analyzers can also be used directly as tools in agentic flows, to turn an incoming file into a structured representation.</P>
  </>
);

const Modes = () => (
  <>
    <Callout kind="trap" title="The exam skills mention pro mode, but it's retired">
      The study guide (April 2026) says "configure single-task and pro-mode Content Understanding pipelines". But <strong>pro mode only existed in the <C>2025-05-01-preview</C> API, which Microsoft has retired</strong>. Its replacement is <strong>agentic mode</strong>. Learn what pro mode was, in case the exam still names it, and how to build the current equivalent.
    </Callout>
    <H2>From old terms to new</H2>
    <Table head={['Old term (study guide)', 'What it meant', 'Today']} rows={[
      ['Standard or single-task', 'Extracts fields from a single file, with no extra reasoning', <><C>config.workflow</C> set to <C>"default"</C> or omitted</>],
      ['Pro mode', 'Reasoning, multiple input files, and external knowledge bases for validation', <>Agentic mode: <C>config.workflow</C> set to <C>"agentic"</C> (preview)</>],
    ]} />
    <Callout kind="note">
      Matching "single-task" to the standard workflow is an interpretation, because current Microsoft docs don't use that exact phrase. The differences between pro and agentic modes below are from Microsoft's migration guidance.
    </Callout>
    <H2>Agentic mode</H2>
    <P>Use it when the answer isn't sitting in one place and has to be worked out from evidence in the document.</P>
    <UL>
      <li><strong>Multistep reasoning:</strong> connecting information across a document.</li>
      <li><strong>Calculations:</strong> totals and reconciliations not stated directly.</li>
      <li><strong>Validation:</strong> checking values against conditions you describe.</li>
      <li><strong>Visual analysis:</strong> complex tables and figures.</li>
    </UL>
    <Code title="JSON: enable agentic mode (API version 2026-06-01-preview)" code={`
{
  "baseAnalyzerId": "prebuilt-document",
  "config": { "workflow": "agentic" },
  "fieldSchema": { "fields": {
    "CalculatedTotal": { "type": "number", "method": "generate",
                         "description": "Sum of all line items" },
    "TotalsMatch":     { "type": "boolean", "method": "generate",
                         "description": "Whether the calculated total equals the printed total" }
  } }
}
`} />
    <H3>Preview limits</H3>
    <Table head={['Limit', 'Detail']} rows={[
      ['Input', 'One file per request (pro mode allowed several). A single file can hold several logical documents'],
      ['Content', 'Document analyzers only'],
      ['Field methods', <>Fields using the <C>extract</C> method aren't supported</>],
      ['Training', 'Using labeled samples to improve the analyzer isn\'t supported'],
      ['Cost', 'Uses the advanced contextualization rate, and can consume more tokens and take longer'],
      ['Response', <>Returns the resolved value <C>agentic.2026-06-01-preview</C></>],
    ]} />
    <Callout kind="exam">
      Use standard extraction when a value is <strong>stated</strong> in the document. Use agentic mode when it must be <strong>derived or validated</strong>. Microsoft says agentic mode doesn't replace human review in high-impact scenarios.
    </Callout>
    <H2>Video and visual pipelines</H2>
    <UL>
      <li><C>prebuilt-videoSearch</C> detects segments and returns transcript, summary, key frames and timing.</li>
      <li>A custom analyzer with <C>prebuilt-image</C> as its base can extract visual characteristics into your own fields.</li>
      <li>Standard workflows cover these. Agentic mode is for documents only.</li>
    </UL>
  </>
);

export default function ContentUnderstanding() {
  return (
    <ModulePage id="content-understanding"
      intro="Turn messy files into clean markdown and reliable fields for agents, search and automation, including the retired pro-mode trap."
      tabs={[
        { id: 'basics', label: 'Analyzers & output', content: <Basics /> },
        { id: 'build', label: 'Build an analyzer', content: <Build /> },
        { id: 'modes', label: 'Pro & agentic mode', content: <Modes /> },
      ]}
      sources={[
        ['What is Content Understanding?', 'https://learn.microsoft.com/azure/ai-services/content-understanding/overview'],
        ['Prebuilt analyzers', 'https://learn.microsoft.com/azure/ai-services/content-understanding/concepts/prebuilt-analyzers'],
        ['Document solutions', 'https://learn.microsoft.com/azure/ai-services/content-understanding/document/overview'],
        ['Analyzer reference', 'https://learn.microsoft.com/azure/ai-services/content-understanding/concepts/analyzer-reference'],
        ['Agentic mode (includes pro mode migration)', 'https://learn.microsoft.com/azure/ai-services/content-understanding/concepts/agentic-mode'],
        ['Quickstart: Analyze a document with agentic mode', 'https://learn.microsoft.com/azure/ai-services/content-understanding/quickstart/agentic-mode'],
        ['Tutorial: Build a RAG solution', 'https://learn.microsoft.com/azure/ai-services/content-understanding/tutorial/build-rag-solution'],
        ['Migrate from preview to GA', 'https://learn.microsoft.com/azure/ai-services/content-understanding/how-to/migration-preview-to-ga'],
        ['Terminology', 'https://learn.microsoft.com/azure/ai-services/content-understanding/glossary'],
        ['Choose the right tool for document processing', 'https://learn.microsoft.com/azure/ai-services/content-understanding/choosing-right-ai-tool'],
      ]} />
  );
}
