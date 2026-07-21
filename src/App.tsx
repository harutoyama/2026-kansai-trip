import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AccessGate } from './components/AccessGate'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ItineraryPage } from './pages/ItineraryPage'
import { PlanningPage } from './pages/PlanningPage'
import { TransportPage } from './pages/TransportPage'

export default function App() {
  return (
    <AccessGate>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="itinerary" element={<ItineraryPage />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="notes" element={<Navigate to="/planning" replace />} />
            <Route path="documents" element={<Navigate to="/planning" replace />} />
            <Route path="chat" element={<Navigate to="/planning" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AccessGate>
  )
}
