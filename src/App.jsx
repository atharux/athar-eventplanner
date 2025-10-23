import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";
import EventList from "./components/EventList";
import VendorList from "./components/VendorList";
import TimelineView from "./components/TimelineView";
import Toast from "./components/Toast";
import CreateEventModal from "./components/CreateEventModal";
import { Sidebar, SearchBox, EventList, VendorList, TimelineView, Toast, CreateEventModal } from './components';


export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState([
    { id: 1, name: "Metropolitan Ball", date: "2025-04-20", status: "active", budget: 120000 },
    { id: 2, name: "Tech Conference", date: "2025-08-09", status: "planning", budget: 70000 },
    // ... add your other events here
  ]);
  const [vendors, setVendors] = useState([
    { id: 1, name: "Elegant Catering", category: "Catering", favorite: false },
    { id: 2, name: "Grand Ballroom", category: "Venue", favorite: false },
    // ... add other vendors here
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter example
  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (id) => {
    setVendors(
      vendors.map((v) =>
        v.id === id ? { ...v, favorite: !v.favorite } : v
      )
    );
    setToastMsg("Vendor favorite toggled");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 max-w-full overflow-auto">
        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {activeTab === "events" && (
          <EventList events={filteredEvents} />
        )}
        {activeTab === "vendors" && (
          <VendorList vendors={filteredVendors} toggleFavorite={toggleFavorite} />
        )}
        {activeTab === "timeline" && (
          <TimelineView events={filteredEvents} />
        )}
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(newEvent) => {
              setEvents([...events, newEvent]);
              setShowCreateModal(false);
              setToastMsg("Event created");
            }}
          />
        )}
      </main>
      <Toast message={toastMsg} clear={() => setToastMsg("")} />
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md shadow-lg"
        onClick={() => setShowCreateModal(true)}
        aria-label="New Event"
      >
        +
      </button>
    </div>
  );
}
