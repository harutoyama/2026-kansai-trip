import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ChatPage } from './pages/ChatPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { HomePage } from './pages/HomePage'
import { ItineraryPage } from './pages/ItineraryPage'
import { TransportPage } from './pages/TransportPage'
export default function App(){return <HashRouter><Routes><Route element={<Layout/>}><Route index element={<HomePage/>}/><Route path="itinerary" element={<ItineraryPage/>}/><Route path="transport" element={<TransportPage/>}/><Route path="documents" element={<DocumentsPage/>}/><Route path="chat" element={<ChatPage/>}/></Route></Routes></HashRouter>}
