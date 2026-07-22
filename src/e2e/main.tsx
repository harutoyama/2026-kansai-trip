import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ItineraryPage } from '../pages/ItineraryPage'
import { PlanningPage } from '../pages/PlanningPage'
import '../index.css'
import { useE2eSharedContent } from './useE2eSharedContent'

const target = new URLSearchParams(window.location.search).get('page')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {target === 'itinerary'
      ? <ItineraryPage />
      : <PlanningPage useSharedContentHook={useE2eSharedContent} />}
  </StrictMode>
)
