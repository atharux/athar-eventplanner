import React from 'react'
export function TaskMatrix(){
  return (
    <div className="overflow-auto rounded-xl border border-white/10">
      <table className="min-w-full text-left">
        <thead className="text-slate-300 text-xs uppercase">
          <tr>
            <th className="p-4">Stage</th>
            <th className="p-4">Task</th>
            <th className="p-4">Planner</th>
            <th className="p-4">Vendor</th>
            <th className="p-4">Venue Manager</th>
            <th className="p-4">Client</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr className="border-t border-white/10">
            <td className="p-4">Event Creation</td>
            <td className="p-4">Define event type, date, budget</td>
            <td className="p-4">Lead</td>
            <td className="p-4">No</td>
            <td className="p-4">No</td>
            <td className="p-4">No</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}