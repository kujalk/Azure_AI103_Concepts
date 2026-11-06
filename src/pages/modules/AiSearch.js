import { useState } from 'react';
import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, Flow, H2, H3, OL, P, Panel, Table, UL } from '../../components/ui';

const docs = ['Returns policy', 'Boot care guide', 'Order FAQ', 'Warranty terms'];

const RrfCalculator = () => {
  const [ranks, setRanks] = useState({ 'Returns policy': [3, 1], 'Boot care guide': [1, 4], 'Order FAQ': [2, 3], 'Warranty terms': [4, 2] });
  const k = 60;
  const update = (doc, i, value) => setRanks(r => { const next = [...r[doc]]; next[i] = Number(value); return { ...r, [doc]: next }; });
  const scored = docs
    .map(doc => ({ doc, score: ranks[doc].reduce((sum, rank) => sum + 1 / (rank + k), 0) }))
    .sort((a, b) => b.score - a.score);
  return (
    <Panel title="RRF calculator">
      <p className="mb-3 text-sm leading-6 text-slate-600">Change each document's rank in the two lists. RRF only looks at positions, so BM25 and vector scores never have to be compared.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] text-sm">
          <thead><tr className="text-left text-slate-600"><th scope="col" className="py-1">Document</th><th scope="col">Keyword rank</th><th scope="col">Vector rank</th><th scope="col">RRF score</th></tr></thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc} className="border-t border-slate-200">
                <td className="py-1.5 font-medium text-slate-900">{doc}</td>
                {[0, 1].map(i => (
                  <td key={i}>
                    <select aria-label={`${doc} ${i === 0 ? 'keyword' : 'vector'} rank`} value={ranks[doc][i]} onChange={e => update(doc, i, e.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1">
                      {[1, 2, 3, 4, 5, 10, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                ))}
                <td className="font-mono text-slate-700">{(ranks[doc].reduce((s, r) => s + 1 / (r + k), 0)).toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-lg bg-azure-50 p-3 text-sm" aria-live="polite">
        <span className="font-semibold text-slate-900">Fused ranking: </span>{scored.map((s, i) => `${i + 1}. ${s.doc}`).join('   ')}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">Formula: score = sum of 1 / (rank + k) across lists, with k = 60. A document ranked first in both lists scores 2/61 = 0.03279, which matches the kind of low score you see in hybrid results. That's by design.</p>
    </Panel>
  );
};

const Ingest = () => (
  <>
    <H2>The indexing pipeline</H2>
    <Flow steps={[
      { title: 'Data source', sub: 'Blob, SQL and others' },
      { title: 'Indexer', sub: 'Crawls on a schedule' },
      { title: 'Skillset', sub: 'OCR, chunk, embed, enrich' },
      { title: 'Index', sub: 'Text and vector fields' },
      { title: 'Agent or app', sub: 'Queries for grounding' },
    ]} />
    <H2>Skills</H2>
    <Table head={['Skill', 'Use']} rows={[
      ['OCR', 'Read text from images and scans'],
      ['Text Split', 'Chunk long content'],
      ['Azure OpenAI Embedding', 'Generate vectors with a deployed embedding model'],
      ['Azure Vision multimodal (preview)', 'Vectorize images and text'],
      ['Text translation', 'Translate content during indexing'],
      ['Language skills', 'Entity recognition, PII detection and others'],
      ['AML skill', 'Call a model in the Foundry catalog'],
      ['Custom skill', 'Your own logic, hosted externally, for what built-ins can\'t do'],
    ]} />
    <H3>How a skill works</H3>
    <UL>
      <li><strong>Context:</strong> the scope, either once per document (<C>/document</C>) or once per item (<C>/document/countries/*</C>).</li>
      <li><strong>Inputs:</strong> read from nodes in the enriched document.</li>
      <li><strong>Outputs:</strong> added back to the enrichment tree as new nodes.</li>
    </UL>
    <H2>A RAG ingestion flow for scanned PDFs</H2>
    <OL>
      <li>Store files in Azure Blob Storage, and point a data source at them.</li>
      <li>Run OCR or layout analysis, because scanned pages have no text otherwise.</li>
      <li>Split the text into chunks with the Text Split skill.</li>
      <li>Embed each chunk with the same model you'll use at query time.</li>
      <li>Write text and vectors to the index, with metadata for filters and citations.</li>
      <li>Schedule the indexer to pick up changes.</li>
    </OL>
    <Table head={['Option', 'Why']} rows={[
      ['Integrated vectorization', 'Search handles chunking and embedding, from source files to queries'],
      ['Push your own vectors', 'You generate embeddings elsewhere and push them into vector fields'],
      ['Vectorizer in the index', 'Encodes query text into vectors at query time, using the same model as indexing'],
      ['Scalar or binary quantization', 'Reduces vector index size in memory and on disk'],
      ['Knowledge store', 'Saves enriched output to Azure Storage for non-search uses'],
      ['Enrichment cache (preview)', 'Reuses costly OCR and image analysis results across runs'],
    ]} />
    <Callout kind="trap" title="Common trap: mismatched embeddings">
      Index and query vectors must come from the same embedding model. Change the model, and you need to re-embed your content.
    </Callout>
    <H2>Images, audio and video</H2>
    <P>Content Understanding can prepare any of these for indexing, by converting them to markdown and fields that fit a search index. See <a className="text-azure-600 underline" href="#/content-understanding">Content Understanding</a>.</P>
    <H2>Monitor the pipeline</H2>
    <Table head={['Watch', 'For']} rows={[
      ['Indexer run status and errors', 'Data ingestion quality, such as failed documents'],
      ['Document and index counts', 'Content that didn\'t arrive'],
      ['Query latency and throttled queries', 'Search service health and capacity'],
      ['Retrieval and Document Retrieval evaluators', 'Relevance performance over time'],
    ]} />
  </>
);

const Query = () => (
  <>
    <H2>Query types</H2>
    <Table head={['Type', 'How it matches', 'Great for', 'Weak at']} rows={[
      ['Keyword (BM25)', 'Exact terms in an inverted index', 'Product codes, names, dates, jargon', 'Different wording with the same meaning'],
      ['Vector (HNSW or eKNN)', 'Similar meaning, using embeddings', 'Paraphrased or conceptual questions', 'Exact identifiers'],
      ['Hybrid', 'Runs both in parallel, then merges with RRF', 'Most RAG scenarios', 'Costs more than either alone'],
      ['Hybrid + semantic ranker', 'Reranks the merged top results with a language model', 'Best relevance', 'Premium feature at extra cost'],
    ]} />
    <Callout kind="exam">
      When a question mentions both natural-language questions <strong>and</strong> exact codes or names, choose <strong>hybrid</strong>. Adding the semantic ranker gives the best relevance. Microsoft's benchmarks support hybrid plus semantic ranker for RAG.
    </Callout>
    <RrfCalculator />
    <H2>Semantic ranker</H2>
    <UL>
      <li>It's a <strong>second-stage reranker</strong> over results already scored by BM25 or RRF, and it can't find new documents.</li>
      <li>It works on the <strong>top 50</strong> results, so set <C>k</C> to 50 when combining with vectors.</li>
      <li>Its score is <C>@search.rerankerScore</C>, from 0 to 4, separate from <C>@search.score</C>.</li>
      <li>It returns <strong>captions</strong> and optional <strong>answers</strong>, using verbatim text from your documents. It doesn't generate text.</li>
      <li><strong>Query rewrite (preview)</strong> creates up to 10 query variants, correcting typos and adding synonyms.</li>
    </UL>
    <Callout kind="trap" title="Common trap: two different k values">
      <C>k</C> in a vector query is the number of nearest neighbours. <C>k</C> in RRF is the constant 60. They're unrelated. Filters and semantic ranking also apply to text content, not to vectors themselves.
    </Callout>
    <Code title="Python: hybrid query with semantic ranking" code={`
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery

search = SearchClient(endpoint=SEARCH_ENDPOINT, index_name="policies", credential=DefaultAzureCredential())

results = search.search(
    search_text=question,                       # keyword side
    vector_queries=[VectorizableTextQuery(      # vector side; the index's vectorizer embeds the text
        text=question, k_nearest_neighbors=50, fields="contentVector",
    )],
    query_type="semantic",
    semantic_configuration_name="default",
    top=5,                                      # how many results you actually use
)
context = "\\n\\n".join(f"[{r['title']}] {r['content']}" for r in results)
`} />
  </>
);

const Rag = () => (
  <>
    <H2>Three ways to give an agent knowledge</H2>
    <Table head={['Option', 'What you manage', 'Choose when']} rows={[
      ['File search tool', 'Files and a vector store. No search service', 'Quick grounding on uploaded documents'],
      ['Azure AI Search tool', 'Your index, chunking and query type', 'You have a tuned index or need full control'],
      ['Foundry IQ knowledge base', 'Knowledge sources. Indexing and sync are automated', 'Several sources, shared across agents, with permissions enforced'],
    ]} />
    <H2>Foundry IQ and agentic retrieval</H2>
    <Flow steps={[
      { title: 'Complex question', sub: 'Plus chat history' },
      { title: 'Query planning', sub: 'Optional LLM makes subqueries' },
      { title: 'Parallel search', sub: 'Across knowledge sources' },
      { title: 'Semantic rerank', sub: 'Each subquery' },
      { title: 'Unified result', sub: 'With references and activity log' },
    ]} />
    <Table head={['Term', 'Meaning']} rows={[
      ['Knowledge base', 'The top-level resource. It defines sources and retrieval behaviour, and several agents can share it'],
      ['Knowledge source', 'A connection to content, such as Blob Storage, SharePoint, OneLake or the public web'],
      ['Agentic retrieval', 'The multi-query engine that powers it'],
      ['Retrieval reasoning effort', 'minimal, low or medium. Iterative search needs medium'],
    ]} />
    <UL>
      <li><strong>Azure AI Search is required.</strong> Foundry IQ is built on it.</li>
      <li><strong>Foundry Agent Service isn't required.</strong> Any app can call the knowledge base.</li>
      <li>It enforces permissions at query time, using ACLs and Purview sensitivity labels, under the caller's Entra identity.</li>
      <li>It adds latency compared with a single query, in exchange for handling complex, multi-part questions.</li>
      <li>Some features are GA in the <C>2026-04-01</C> REST API, while the portals use preview features.</li>
    </UL>
    <H2>Connect retrieval to an agent</H2>
    <Code title="Python: Azure AI Search tool" code={`
from azure.ai.projects.models import (
    AzureAISearchTool, AzureAISearchToolResource, AISearchIndexResource,
    AzureAISearchQueryType, PromptAgentDefinition,
)

connection = project.connections.get("my-search-connection")

agent = project.agents.create_version(
    agent_name="policy-agent",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",
        instructions="Answer only from the search tool, and always cite your sources.",
        tools=[AzureAISearchTool(azure_ai_search=AzureAISearchToolResource(indexes=[
            AISearchIndexResource(
                project_connection_id=connection.id,
                index_name="policies",
                query_type=AzureAISearchQueryType.SIMPLE,   # hybrid and semantic types also exist
            ),
        ]))],
    ),
)
`} />
    <Code title="Python: Foundry IQ knowledge base, through its MCP endpoint" code={`
from azure.ai.projects.models import MCPTool

kb_tool = MCPTool(
    server_label="knowledge-base",
    server_url=f"{search_endpoint}/knowledgebases/{kb_name}/mcp?api-version=<version>",
    require_approval="never",
    allowed_tools=["knowledge_base_retrieve"],
    project_connection_id=connection_id,
)
`} />
    <H2>RAG in your own application</H2>
    <OL>
      <li>Run a hybrid query, as on the Query tab.</li>
      <li>Build a prompt that holds the retrieved chunks, and mark them as data.</li>
      <li>Tell the model to answer only from them, cite sources, and admit when it can't answer.</li>
      <li>Enable document attack detection, because retrieved text can hold injected instructions.</li>
      <li>Evaluate with Retrieval, Groundedness and Relevance.</li>
    </OL>
    <Code title="Python: the generation step" code={`
response = openai.responses.create(
    model="gpt-5-mini",
    instructions=(
        "Answer using only the documents below and cite the document title. "
        "If they don't contain the answer, say you don't know."
    ),
    input=f'{question} """ <documents>\\n{context}\\n</documents> """',
)
`} />
    <H3>Diagnose by evaluator</H3>
    <Table head={['Result', 'Likely problem', 'Try']} rows={[
      ['Low Retrieval', 'The right chunks weren\'t found', 'Hybrid, semantic ranker, chunking'],
      ['Good Retrieval, low Groundedness', 'The model went beyond the context', 'Tighter instructions, or a different model'],
      ['Grounded but low Relevance', 'True, but doesn\'t answer the question', 'Instructions and query rewriting'],
    ]} />
  </>
);

export default function AiSearch() {
  return (
    <ModulePage id="ai-search"
      intro="Ingest and enrich your content, choose the right search method, and wire the results into agents and applications."
      tabs={[
        { id: 'ingest', label: 'Ingest & enrich', content: <Ingest /> },
        { id: 'query', label: 'Search methods', content: <Query /> },
        { id: 'rag', label: 'RAG & Foundry IQ', content: <Rag /> },
      ]}
      sources={[
        ['Hybrid search overview', 'https://learn.microsoft.com/azure/search/hybrid-search-overview'],
        ['Relevance scoring using RRF', 'https://learn.microsoft.com/azure/search/hybrid-search-ranking'],
        ['Semantic ranking', 'https://learn.microsoft.com/azure/search/semantic-search-overview'],
        ['Vector search', 'https://learn.microsoft.com/azure/search/vector-search-overview'],
        ['Features of Azure AI Search', 'https://learn.microsoft.com/azure/search/search-features-list'],
        ['Skillset concepts', 'https://learn.microsoft.com/azure/search/cognitive-search-working-with-skillsets'],
        ['What is Foundry IQ?', 'https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq'],
        ['Agentic retrieval', 'https://learn.microsoft.com/azure/search/agentic-retrieval-overview'],
        ['Connect an Azure AI Search index to agents', 'https://learn.microsoft.com/azure/foundry/agents/how-to/tools/ai-search'],
        ['RAG information retrieval guide', 'https://learn.microsoft.com/azure/architecture/ai-ml/guide/rag/rag-information-retrieval'],
      ]} />
  );
}
