import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import WorkflowExecution from '@/pages/WorkflowExecution';
import Documents from '@/pages/Documents';
import Knowledge from '@/pages/Knowledge';
import Analytics from '@/pages/Analytics';
import AgentManagement from '@/pages/AgentManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="workflow/:id" element={<WorkflowExecution />} />
          <Route path="documents" element={<Documents />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="agent" element={<AgentManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
