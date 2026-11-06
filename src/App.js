import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExamGuide from './pages/ExamGuide';
import MockExam from './pages/MockExam';
import NotFound from './pages/NotFound';
import FoundryPlatform from './pages/modules/FoundryPlatform';
import ModelSelection from './pages/modules/ModelSelection';
import DeploymentsQuotas from './pages/modules/DeploymentsQuotas';
import Security from './pages/modules/Security';
import Guardrails from './pages/modules/Guardrails';
import Cicd from './pages/modules/Cicd';
import AgentTypes from './pages/modules/AgentTypes';
import AgentTools from './pages/modules/AgentTools';
import MultiAgent from './pages/modules/MultiAgent';
import Telemetry from './pages/modules/Telemetry';
import Evaluation from './pages/modules/Evaluation';
import Optimization from './pages/modules/Optimization';
import ImageVideo from './pages/modules/ImageVideo';
import Multimodal from './pages/modules/Multimodal';
import Language from './pages/modules/Language';
import Speech from './pages/modules/Speech';
import AiSearch from './pages/modules/AiSearch';
import ContentUnderstanding from './pages/modules/ContentUnderstanding';

export const moduleComponents = {
  'foundry-platform': FoundryPlatform,
  'model-selection': ModelSelection,
  'deployments-quotas': DeploymentsQuotas,
  security: Security,
  guardrails: Guardrails,
  cicd: Cicd,
  'agent-types': AgentTypes,
  'agent-tools': AgentTools,
  'multi-agent': MultiAgent,
  telemetry: Telemetry,
  evaluation: Evaluation,
  optimization: Optimization,
  'image-video': ImageVideo,
  multimodal: Multimodal,
  language: Language,
  speech: Speech,
  'ai-search': AiSearch,
  'content-understanding': ContentUnderstanding,
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/exam-guide" element={<ExamGuide />} />
          <Route path="/mock-exam" element={<MockExam />} />
          {Object.entries(moduleComponents).map(([id, Page]) => <Route key={id} path={`/${id}`} element={<Page />} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
