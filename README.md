# AI-103 Study Guide

An interactive study site for Microsoft **Exam AI-103: Developing AI Apps and Agents on Azure**, which leads to the Azure AI Apps and Agents Developer Associate certification.

It's organised around the [official study guide](https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-103) (skills measured as of April 16, 2026). Every one of the 64 listed skills links to the module that teaches it.

## What's included

- **18 modules** across the five exam domains, each with Python samples and links to its Microsoft sources
- **Exam map and checklist** of every official skill, saved in your browser
- **122 scenario questions**, plus a practice exam weighted by domain
- **Interactive tools:** model picker, trace explorer, guardrail and blocking-level explorers, RPM window calculator, RRF calculator, inpainting mask demo

| Domain | Weight | Modules |
| --- | --- | --- |
| Plan and manage an Azure AI solution | 25–30% | Foundry Platform, Choosing a Model, Deployments and Quotas, Security, Guardrails, CI/CD |
| Implement generative AI and agentic solutions | 30–35% | Building Agents, Tools and Memory, Multi-Agent Workflows, Telemetry, Evaluation, Optimization |
| Implement computer vision solutions | 10–15% | Image and Video Generation, Multimodal Understanding |
| Implement text analysis solutions | 10–15% | Language and Translation, Speech and Voice Agents |
| Implement information extraction solutions | 10–15% | Azure AI Search and RAG, Content Understanding |

## Run it locally

You need Node.js 18 or later.

```bash
npm install
npm start       # http://localhost:3000
npm test        # checks content integrity, every page, the quiz and the practice exam
```

## Deploy to GitHub Pages

The site uses `"homepage": "."` and hash routing, so it works under any repository name with no configuration.

```bash
npm run deploy  # builds the site and publishes it to the gh-pages branch
```

Then, in the repository's **Settings > Pages**, set the source to the `gh-pages` branch.

## Add or update content

| To change | Edit |
| --- | --- |
| A module's content | `src/pages/modules/` |
| Quiz and practice exam questions | `src/data/questions.js` |
| Which skill maps to which module | `src/data/skills.js` |
| Navigation and home page cards | `src/data/modules.js` |

To add a module, add it to `modules.js`, create its page, register the page in `src/App.js`, and add at least six questions. `npm test` fails if any of those is missing.

## Keeping it current

Microsoft Foundry changes quickly. Before relying on a detail, check the page's **Sources** tab, and re-check the study guide for changes to the skills measured. Content was last reviewed in November 2026.

## Disclaimer

An unofficial study aid, not affiliated with or endorsed by Microsoft. The practice questions are original and aren't real exam questions.
