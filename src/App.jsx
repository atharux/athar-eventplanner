import React from 'react'
import { Sidebar } from './components/Sidebar'
import { TaskMatrix } from './components/TaskMatrix'
import { NeonSignature } from './components/NeonSignature'

export default function App(){
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-full mx-auto">
          <div className="glass rounded-2xl p-6 shadow-neon">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Event Planner — Task Matrix</h1>
                <p className="text-sm text-slate-300 mt-1">Interactive responsibilities grid — Planner, Vendor, Venue Manager, Client</p>
              </div>
            </header>
            <TaskMatrix />
            <div className="mt-8 flex justify-end">
              <NeonSignature />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}