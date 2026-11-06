// Weights and names are copied from the official AI-103 study guide
// (skills measured as of April 16, 2026). Tailwind class strings are literal so purge keeps them.
const domains = [
  { id: 'plan', short: 'Plan & manage', name: 'Plan and manage an Azure AI solution', weight: '25–30%', low: 25, high: 30,
    badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700', soft: 'bg-blue-50' },
  { id: 'genai', short: 'GenAI & agents', name: 'Implement generative AI and agentic solutions', weight: '30–35%', low: 30, high: 35,
    badge: 'bg-violet-100 text-violet-800', bar: 'bg-violet-600', border: 'border-violet-600', text: 'text-violet-700', soft: 'bg-violet-50' },
  { id: 'vision', short: 'Computer vision', name: 'Implement computer vision solutions', weight: '10–15%', low: 10, high: 15,
    badge: 'bg-rose-100 text-rose-800', bar: 'bg-rose-600', border: 'border-rose-600', text: 'text-rose-700', soft: 'bg-rose-50' },
  { id: 'text', short: 'Text analysis', name: 'Implement text analysis solutions', weight: '10–15%', low: 10, high: 15,
    badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600', border: 'border-emerald-600', text: 'text-emerald-700', soft: 'bg-emerald-50' },
  { id: 'extract', short: 'Information extraction', name: 'Implement information extraction solutions', weight: '10–15%', low: 10, high: 15,
    badge: 'bg-amber-100 text-amber-900', bar: 'bg-amber-600', border: 'border-amber-600', text: 'text-amber-800', soft: 'bg-amber-50' },
];

export const domainById = Object.fromEntries(domains.map(d => [d.id, d]));
export default domains;
