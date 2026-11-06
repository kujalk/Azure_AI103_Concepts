// Single source of truth for navigation, the home grid, the exam map and the mock exam.
const modules = [
  { id: 'foundry-platform', title: 'Microsoft Foundry Platform', domain: 'plan', icon: '🏛️', summary: 'Foundry resource and projects, the portal, SDK and endpoints, and the old-to-new names you\'ll still see in older material.' },
  { id: 'model-selection', title: 'Choosing a Model', domain: 'plan', icon: '🎯', summary: 'Pick a model for an agent with a worked use case: capability filters, leaderboards, model router and proving it on your own data.', featured: true },
  { id: 'deployments-quotas', title: 'Deployments, Quotas & Cost', domain: 'plan', icon: '📈', summary: 'Global, Data Zone and regional deployment types, PTUs, batch, TPM and RPM limits, and how to triage a 429.' },
  { id: 'security', title: 'Security & Identity', domain: 'plan', icon: '🔐', summary: 'Keyless auth, managed identity, Foundry RBAC roles, basic vs standard agent setup and private networking.' },
  { id: 'guardrails', title: 'Guardrails & Responsible AI', domain: 'plan', icon: '🛡️', summary: 'Risks, intervention points and blocking levels, Prompt Shields, task adherence and auditing.' },
  { id: 'cicd', title: 'Infrastructure & CI/CD', domain: 'plan', icon: '🚀', summary: 'azd, Bicep and Terraform, OIDC pipelines, evaluation gates and gradual rollout of agent versions.' },

  { id: 'agent-types', title: 'Building Agents', domain: 'genai', icon: '🤖', summary: 'Prompt, voice-based and hosted agents vs the Responses API, plus roles, goals and conversation tracking in code.' },
  { id: 'agent-tools', title: 'Agent Tools & Memory', domain: 'genai', icon: '🧰', summary: 'Function calling, MCP, toolboxes, file search vs Foundry IQ vs memory, and tool approval.' },
  { id: 'multi-agent', title: 'Multi-Agent Workflows', domain: 'genai', icon: '🕸️', summary: 'Sequential, concurrent, group chat and handoff orchestration, human-in-the-loop and safeguards.' },
  { id: 'telemetry', title: 'Telemetry & Observability', domain: 'genai', icon: '📡', summary: 'How traces flow from an agent to Application Insights: spans, gen_ai attributes, KQL, dashboards and troubleshooting.', featured: true },
  { id: 'evaluation', title: 'Evaluating Models & Agents', domain: 'genai', icon: '✅', summary: 'Quality, RAG, agent and safety evaluators, continuous evaluation, red teaming and regression gates.' },
  { id: 'optimization', title: 'Prompting & Optimization', domain: 'genai', icon: '🎛️', summary: 'Prompt engineering, model parameters, structured outputs, reflection loops and hybrid LLM-plus-rules designs.' },

  { id: 'image-video', title: 'Image & Video Generation', domain: 'vision', icon: '🎨', summary: 'gpt-image generation and mask-based inpainting, Sora 2 generation and remix, and generation controls.' },
  { id: 'multimodal', title: 'Multimodal Understanding', domain: 'vision', icon: '👁️', summary: 'Vision-enabled models, captions and alt text, grounded visual Q&A, video analysis and visual safety.' },

  { id: 'language', title: 'Language & Translation', domain: 'text', icon: '💬', summary: 'Generative prompts vs Azure Language, PII and entities, structured JSON, and Translator NMT vs LLM.' },
  { id: 'speech', title: 'Speech & Voice Agents', domain: 'text', icon: '🎙️', summary: 'Speech to text and text to speech, Voice Live, voice-based prompt agents, custom speech and speech translation.' },

  { id: 'ai-search', title: 'Azure AI Search & RAG', domain: 'extract', icon: '🔎', summary: 'Ingestion and skillsets, vector, hybrid and semantic search with an RRF calculator, and agentic retrieval.' },
  { id: 'content-understanding', title: 'Content Understanding', domain: 'extract', icon: '📄', summary: 'Analyzers, extract/classify/generate fields, markdown for RAG, confidence and grounding, and agentic mode.' },
];

export const moduleById = Object.fromEntries(modules.map(m => [m.id, m]));
export const pathFor = id => `/${id}`;
export default modules;
