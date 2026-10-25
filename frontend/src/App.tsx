import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AccuracyPage } from './pages/AccuracyPage'
import { DecisionView } from './pages/DecisionView'
import { LandingPage } from './pages/LandingPage'
import { MethodologyPage } from './pages/MethodologyPage'

export default function App() {
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path="dashboard" element={<AppShell />}>
        <Route index element={<DecisionView />} />
        <Route path="accuracy" element={<AccuracyPage />} />
        <Route path="methodology" element={<MethodologyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
