import React, { useState, useEffect } from "react";

import {
  Sidebar,
  SearchBox,
  EventList,
  VendorList,
  TimelineView,
  Toast,
  CreateEventModal,
  EventCreationProgress,
  EventDetails,
} from "./components";

export default function App() {
  // Common demo state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Event Data
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Corporate Summit 2025",
      date: "2025-09-15",
      status: "active",
      budget: 120000,
      guests: 250,
      venueName: "Grand Hall",
      contactInfo: "events@corporate.com",
      notes: "VIP Guests expected",
      loadingZones: { outside: "Dock A", inside: "Backstage" },
      squareFootage: { outside: 5000, inside: 20000 },
      completedSteps: ["vendors", "venue"],
    },
    // Add other events here...
  ]);
  // Vendors state demo
  const [vendors, setVendors] = useState([
    { id: 1, name: "Elegant Catering", category: "Catering", favorite: false },
    { id: 2, name: "Grand Ballroom", category: "Venue", favorite: false },
    // Add others...
  ]);

  // UI state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vendor favorite toggling
  const toggleFavorite = (id) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, favorite: !v.favorite } : v 
      )
    );
    setToastMsg("Vendor favorite toggled");
  };

  // Close modal toast helper
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Reset selected event when switching tabs away from "events"
  useEffect(() => {
    if (activeTab !== "events") setSelectedEvent(null);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 max-w-full overflow-auto">
        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {activeTab === "dashboard" && (
          <div>
            {/* Dashboard overview layout example */}
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p>Summary charts, notifications, quick links etc (to be expanded)</p>
          </div>
        )}

        {activeTab === "events" && (
          <>
            {!selectedEvent ? (
              <>
                <button
                  className="mb-4 px-3 py-1 rounded-sm bg-blue-600 text-white"
                  onClick={() => setShowCreateModal(true)}
                >
                  + New Event
                </button>
                <EventList events={filteredEvents} onSelectEvent={setSelectedEvent} />
              </>
            ) : (
              <>
                <EventCreationProgress completedSteps={selectedEvent.completedSteps} />
                <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
              </>
            )}
          </>
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
              setToastMsg("Event created!");
            }}
          />
        )}

        <Toast message={toastMsg} clear={() => setToastMsg("")} />
      </main>
    </div>
  );
}
