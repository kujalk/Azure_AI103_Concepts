import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, H2, H3, P, Table, UL } from '../../components/ui';

const Choose = () => (
  <>
    <H2>Prompt an LLM, or use Azure Language?</H2>
    <Table head={['', 'Generative prompting', 'Azure Language in Foundry Tools']} rows={[
      ['Best for', 'Custom output, nuance and domain tasks', 'Well-defined, repeatable extraction'],
      ['Output', 'Whatever your schema asks for', 'A fixed, documented response'],
      ['Setup', 'Write and evaluate a prompt', 'Call the API. Custom features need training'],
      ['Example', 'Summarize a contract for compliance staff', 'Detect and redact PII'],
    ]} />
    <H2>Azure Language at a glance</H2>
    <Table head={['Task', 'Feature', 'Customizable?']} rows={[
      ['Find and redact personal data', 'PII detection (text, conversation, document)', 'Configurable policies'],
      ['Identify the language', 'Language detection', 'No'],
      ['Find standard entities', 'Prebuilt NER', 'No'],
      ['Find your own entity types', 'Custom NER', 'Yes, you train it'],
      ['Extract clinical information', 'Text analytics for health', 'No'],
      ['Sentiment and opinions', 'Sentiment analysis and opinion mining', 'No'],
      ['Main phrases', 'Key phrase extraction', 'No'],
      ['Condense text or calls', 'Summarization (extractive or abstractive)', 'No'],
      ['Put documents in categories', 'Custom text classification', 'Yes'],
      ['Predict user intent', 'Conversational language understanding', 'Yes'],
    ]} />
    <Callout kind="trap" title="Common trap: core vs legacy">
      Microsoft now lists <strong>PII detection, language detection, NER and text analytics for health</strong> as core capabilities recommended for new development. Sentiment analysis, summarization, question answering and orchestration workflow appear under <strong>legacy capabilities</strong>. For new work on those tasks, an LLM is often the better fit. Still learn both, because the exam skill says "generative prompting and Foundry Tools".
    </Callout>
    <H3>Extractive vs abstractive summarization</H3>
    <UL>
      <li><strong>Extractive:</strong> selects key sentences, unchanged from the source.</li>
      <li><strong>Abstractive:</strong> writes new, concise sentences.</li>
    </UL>
    <P>Azure Language is also available to agents as tools through its <strong>MCP server</strong>, as a remote server in the Foundry tool catalog or as a local server.</P>
  </>
);

const Extract = () => (
  <>
    <H2>Structured JSON with generative prompting</H2>
    <Code title="Python: extract entities, topics, sentiment and a summary together" code={`
from typing import Literal
from pydantic import BaseModel

class Entity(BaseModel):
    text: str
    type: Literal["person", "product", "order_id", "date"]

class ReviewAnalysis(BaseModel):
    summary: str
    topics: list[str]
    entities: list[Entity]
    sentiment: Literal["positive", "neutral", "negative"]
    tone: Literal["calm", "frustrated", "angry"]
    needs_human: bool

result = openai.responses.parse(
    model="gpt-5-mini",
    instructions="Extract only what the text states. Don't infer details that aren't there.",
    input=customer_message,
    text_format=ReviewAnalysis,
).output_parsed
`} />
    <P>One call returns everything in one validated shape. With prebuilt services you'd call several features and merge the results. The trade-off is that you own the prompt's quality, so test it with an evaluation set.</P>
    <H2>Detect sentiment, tone, safety and sensitive content</H2>
    <Table head={['Signal', 'Options']} rows={[
      ['Sentiment', 'Azure Language sentiment analysis, or an LLM field'],
      ['Tone', 'An LLM, since it isn\'t a prebuilt category'],
      ['Harmful content', 'Guardrails and Azure AI Content Safety'],
      ['Sensitive content', 'PII detection, or a PII guardrail control'],
    ]} />
    <Code title="Python: detect and redact PII with Azure Language" code={`
from azure.ai.textanalytics import TextAnalyticsClient
from azure.identity import DefaultAzureCredential

client = TextAnalyticsClient(endpoint=LANGUAGE_ENDPOINT, credential=DefaultAzureCredential())

doc = client.recognize_pii_entities(["Call Maria on 555-0100 about order A1042."])[0]
print(doc.redacted_text)
for entity in doc.entities:
    print(entity.category, entity.text, entity.confidence_score)
`} />
    <H2>Customize for a domain</H2>
    <Table head={['Goal', 'How']} rows={[
      ['Compliance summaries', 'Instructions listing required sections, plus a schema, plus a rubric evaluator to check them'],
      ['Domain extraction', 'A schema with your own fields, plus few-shot examples using your terms'],
      ['Consistent domain labels', 'Enums in the schema, so it can\'t invent a new category'],
      ['Grounded output', 'Require quotes from the source, and check with Groundedness'],
      ['Still not accurate enough', 'Fine-tune a model, or train Custom NER'],
    ]} />
  </>
);

const Translate = () => (
  <>
    <H2>Translator or an LLM?</H2>
    <Table head={['Choice', 'Strengths', 'Use it for']} rows={[
      ['Translator with NMT', 'Standard neural translation, fast and predictable', 'High-volume general translation'],
      ['Translator with an LLM deployment', 'Tone and gender controls, adaptive custom translation', 'Quality-sensitive content such as marketing'],
      ['Your own LLM prompt', 'Complete freedom: glossaries, style, mixed tasks', 'Translating and transforming in one step'],
      ['Custom Translator', 'Trains on your terminology', 'Consistent domain vocabulary'],
    ]} />
    <H2>Translator API 2026-06-06</H2>
    <Callout kind="trap" title="Common trap: breaking changes">
      API version <C>2026-06-06</C> is GA and has <strong>breaking changes from v3.0</strong>. The request array is now <C>inputs</C> and the response array is <C>value</C>. Older samples use the v3.0 shape.
    </Callout>
    <Table head={['New in 2026-06-06', 'Detail']} rows={[
      ['Model choice', 'Select NMT or an LLM deployment. LLM needs a Microsoft Foundry resource'],
      ['Adaptive custom translation', 'Up to five reference translations, or an adaptive dataset index ID, to guide LLM style and terms'],
      ['Tone', 'LLM translation offers formal, informal or neutral'],
      ['Gender', 'LLM translation offers gender-specific output'],
    ]} />
    <Callout kind="exam">
      Remember the two conditions together: tone and gender controls apply to <strong>LLM-based</strong> translation, and they need a <strong>Foundry resource</strong>. If a scenario must control formality, plain NMT isn't enough.
    </Callout>
    <H3>Related capabilities</H3>
    <UL>
      <li><strong>Transliteration:</strong> converts text from one script to another, in the same language.</li>
      <li><strong>Language detection:</strong> find the source language first when it's unknown.</li>
      <li><strong>Speech translation:</strong> see the Speech page.</li>
    </UL>
  </>
);

export default function Language() {
  return (
    <ModulePage id="language"
      intro="Extract meaning from text with prompts or prebuilt services, return it as structured JSON, and translate it."
      tabs={[
        { id: 'choose', label: 'LLM vs Language', content: <Choose /> },
        { id: 'extract', label: 'Extract & detect', content: <Extract /> },
        { id: 'translate', label: 'Translate', content: <Translate /> },
      ]}
      sources={[
        ['What is Azure Language in Foundry Tools?', 'https://learn.microsoft.com/azure/ai-services/language-service/overview'],
        ['PII detection overview', 'https://learn.microsoft.com/azure/ai-services/language-service/personally-identifiable-information/overview'],
        ['Structured outputs', 'https://learn.microsoft.com/azure/foundry/openai/how-to/structured-outputs'],
        ['What is Azure text translation?', 'https://learn.microsoft.com/azure/ai-services/translator/text-translation/overview'],
        ['Adaptive custom translation', 'https://learn.microsoft.com/azure/ai-services/translator/custom-translator/azure-ai-foundry/concepts/adaptive-custom-translation'],
      ]} />
  );
}
