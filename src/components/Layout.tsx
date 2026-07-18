import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
export function Layout(){return <><main className="safe-bottom mx-auto min-h-screen max-w-3xl px-4 py-5"><Outlet/></main><BottomNav/></>}
