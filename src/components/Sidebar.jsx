import React from "react";

const tabs = [
  { id: "events", label: "Events" },
  { id: "vendors", label: "Vendors" },
  { id: "timeline", label: "Timeline" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-white border-r border-gray-200 p-4 w-full md:w-56 flex md:flex-col gap-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`text-left w-full px-3 py-2 rounded-md text-sm font-medium ${
            activeTab === tab.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
