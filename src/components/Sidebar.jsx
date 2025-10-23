import React from 'react'
export function Sidebar(){
  const nav = ['Dashboard','Events','Vendors','Venues','Clients','Settings']
  return (
    <aside className="w-72 p-6">
      <div className="glass p-4 rounded-xl flex flex-col h-full">
        <div className="mb-6">
          <div className="text-xl font-bold text-white">Athar UX</div>
          <div className="text-xs text-slate-300 mt-1">All-in-one event planning</div>
        </div>
        <nav className="flex-1">
          {nav.map((n)=>(
            <button key={n} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition mb-2">
              <span className="font-medium">{n}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}