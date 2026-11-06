// Every bullet of "skills measured" from the official study guide (April 16, 2026), mapped to the module that teaches it.
const skills = [
  { domain: 'plan', group: 'Choose the appropriate Foundry services for generative AI and agents', items: [
    ['Choose an appropriate model for each task, including LLMs, small language models, multimodal models, and Foundry Tools', 'model-selection'],
    ['Choose the appropriate Foundry services for generative tasks, grounding, vector search, agent workflows, or multimodal processing', 'foundry-platform'],
    ['Choose an appropriate method for retrieval and indexing', 'ai-search'],
    ['Choose appropriate memory, tool, and knowledge integration services for agent solutions', 'agent-tools'],
  ]},
  { domain: 'plan', group: 'Set up AI solutions in Foundry', items: [
    ['Design Azure infrastructure for AI apps and agent-based solutions', 'security'],
    ['Choose appropriate deployment options', 'deployments-quotas'],
    ['Configure model and agent deployments', 'deployments-quotas'],
    ['Integrate Foundry projects with CI/CD pipelines', 'cicd'],
  ]},
  { domain: 'plan', group: 'Manage, monitor, and secure AI systems', items: [
    ['Manage quotas, scaling, rate limits, and cost footprints for model and agent workloads', 'deployments-quotas'],
    ['Monitor model performance, drift, safety events, and grounding quality', 'telemetry'],
    ['Monitor data ingestion quality, search index health, and relevance performance', 'ai-search'],
    ['Configure security, including managed identity, private networking, keyless credentials, and role policies', 'security'],
  ]},
  { domain: 'plan', group: 'Implement responsible AI across generative AI and agentic systems', items: [
    ['Configure safety filters, guardrails, risk detection, and content moderation', 'guardrails'],
    ['Apply responsible AI instrumentation, including evaluators, safety evaluations, and explanation tooling', 'evaluation'],
    ['Implement auditing through trace logging, provenance metadata, and approval workflows', 'guardrails'],
    ['Govern agent behavior with oversight modes, constraints, and tool-access controls', 'agent-tools'],
  ]},
  { domain: 'genai', group: 'Build generative applications by using Foundry', items: [
    ['Deploy and consume LLMs, small models, code models, and multimodal models', 'model-selection'],
    ['Implement retrieval-augmented generation (RAG) in an application', 'ai-search'],
    ['Design workflows, tool-augmented flows, and multistep reasoning pipelines', 'multi-agent'],
    ['Evaluate models and apps, including detecting fabrications, relevance, quality, and safety', 'evaluation'],
    ['Integrate generative workflows into applications by using Foundry SDKs and connectors', 'foundry-platform'],
    ['Configure an application to connect to a Foundry project', 'foundry-platform'],
  ]},
  { domain: 'genai', group: 'Build agents by using Foundry', items: [
    ['Define agent roles, goals, conversation-tracking approach, and tool schemas', 'agent-types'],
    ['Build agents that integrate retrieval, function-calling, and conversation memory', 'agent-tools'],
    ['Integrate agent tools, including APIs, knowledge stores, search, content understanding, and custom functions', 'agent-tools'],
    ['Implement orchestrated multi-agent solutions', 'multi-agent'],
    ['Build autonomous or semiautonomous workflows with safeguards and approval flow controls', 'multi-agent'],
    ['Integrate monitoring into deployed agents, evaluate agent behavior, and perform error analysis', 'telemetry'],
  ]},
  { domain: 'genai', group: 'Optimize and operationalize generative AI systems', items: [
    ['Tune generation behavior, such as prompt engineering and adjusting model parameters', 'optimization'],
    ['Implement model reflection, chain-of-thought evaluations, and self-critique loops', 'optimization'],
    ['Set up observability by implementing tracing, token analytics, safety signals, and latency breakdowns', 'telemetry'],
    ['Orchestrate multiple models, flows, or hybrid LLM and rules engines', 'optimization'],
  ]},
  { domain: 'vision', group: 'Design and implement image- and video-generation solutions', items: [
    ['Implement a solution that generates images from text prompts and reference media', 'image-video'],
    ['Implement a solution that generates videos from text prompts and reference media', 'image-video'],
    ['Configure image-editing workflows, including inpainting, mask-based edits, and prompt-driven modifications', 'image-video'],
    ['Implement workflows to edit generated videos', 'image-video'],
    ['Select and apply appropriate generation and editing controls provided by the platform', 'image-video'],
  ]},
  { domain: 'vision', group: 'Design and implement multimodal understanding workflows', items: [
    ['Build a solution that analyzes visual context by using multimodal models', 'multimodal'],
    ['Configure apps to produce concise or detailed captions for single or multiple images', 'multimodal'],
    ['Implement a solution that enables question-answering grounded in visual evidence', 'multimodal'],
    ['Configure generation of alt-text and extended image descriptions aligned to accessibility guidelines', 'multimodal'],
    ['Implement visual understanding by configuring Azure Content Understanding in Foundry Tools to extract visual characteristics', 'content-understanding'],
    ['Implement video analysis workflows to process and interpret video segments', 'multimodal'],
    ['Configure single-task and pro-mode Content Understanding pipelines', 'content-understanding'],
    ['Implement solutions that identify objects, components, or regions within images or video', 'multimodal'],
  ]},
  { domain: 'vision', group: 'Implement responsible AI for multimodal content', items: [
    ['Implement filters to classify unsafe or disallowed visual content', 'multimodal'],
    ['Detect and mitigate indirect prompt injection by using embedded text in images', 'multimodal'],
    ['Enforce visual policy rules, such as applying watermarks, flagging prohibited symbols, upholding brand usage requirements, and detecting potentially inappropriate content', 'multimodal'],
  ]},
  { domain: 'text', group: 'Apply language model text analysis', items: [
    ['Implement solutions to extract entities, topics, summaries, and structured JSON outputs by using generative prompting and Foundry Tools', 'language'],
    ['Configure detection of sentiment, tone, safety issues, and sensitive content', 'language'],
    ['Build solutions that translate text by using Azure Translator in Foundry Tools or LLM-powered translation flows', 'language'],
    ['Customize language model outputs for domain tasks, such as compliance summarization and domain extraction', 'language'],
  ]},
  { domain: 'text', group: 'Implement speech solutions', items: [
    ['Implement workflows to convert speech to text and text to speech for agentic interactions', 'speech'],
    ['Integrate speech as an agent modality, including custom speech models', 'speech'],
    ['Enable multimodal reasoning from audio inputs', 'speech'],
    ['Translate speech into other languages by using language models and Foundry Tools', 'speech'],
  ]},
  { domain: 'extract', group: 'Build retrieval and grounding pipelines', items: [
    ['Ingest and index content, such as documents, images, audio, and video', 'ai-search'],
    ['Configure semantic search, hybrid search, and vector search for grounding', 'ai-search'],
    ['Implement enrichment by using custom or built-in skills for text, images, and layout', 'ai-search'],
    ['Configure RAG ingestion flow, including documents and using OCR', 'ai-search'],
    ['Connect retrieval pipelines directly to workflows and agent tools', 'ai-search'],
  ]},
  { domain: 'extract', group: 'Extract content from documents', items: [
    ['Extract information by using multimodal pipelines that combine OCR, layout analysis, and field extraction', 'content-understanding'],
    ['Produce clean, grounded representations to use with agents and RAG by using Content Understanding', 'content-understanding'],
    ['Implement analyzers for generating structured or markdown outputs for downstream reasoning by using Content Understanding', 'content-understanding'],
  ]},
];

export default skills;
