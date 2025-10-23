import React, { useState, useEffect } from "react";

import {
  Sidebar,
  SearchBox,
  EventList,
  VendorList,
  TimelineView,
  Toast,
  EventCreationWizard,
  EventCreationProgress,
  EventDetails,
} from "./components";

import EventCreationWizard from "./components/EventCreationWizard";

// in your App's return {showCreateModal && ( ... )}
{showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <EventCreationWizard
      onCancel={() => setShowCreateModal(false)}
      onComplete={(newEvent) => {
        setEvents([...events, newEvent]);
        setShowCreateModal(false);
        setToastMsg("Event created!");
      }}
    />
  </div>
)}

export default function App() {
  // Common demo state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Event Data
  const [events, setEvents] = useState([
  {
    id: 1,
    name: "Autumn Gala 2025",
    status: "upcoming",
    date: "2025-11-15",
    vendors: [1, 2],
    tasks: [101, 102],
    budget: 100000,
    guests: 300,
    venueName: "Grand Ballroom",
    contactInfo: "events@grandballroom.com",
    notes: "Formal attire required. VIP guests attending.",
    loadingZones: {
      outside: "North Dock",
      inside: "Main Lobby Loading Bay"
    },
    squareFootage: {
      outside: 5000,
      inside: 22000
    }
  },
  {
    id: 2,
    name: "Corporate Tech Conference",
    status: "planning",
    date: "2025-08-30",
    vendors: [3, 4, 7],
    tasks: [201, 202, 203],
    budget: 150000,
    guests: 500,
    venueName: "Convention Center West Wing",
    contactInfo: "planning@techconf.com",
    notes: "Multiple breakout sessions, require AV setup.",
    loadingZones: {
      outside: "Loading Dock B",
      inside: "Conference Hall Rear Entrance"
    },
    squareFootage: {
      outside: 7000,
      inside: 35000
    }
  },
  {
    id: 3,
    name: "Healthcare Summit 2025",
    status: "active",
    date: "2025-06-10",
    vendors: [5, 6],
    tasks: [301, 302],
    budget: 90000,
    guests: 180,
    venueName: "City Event Hall",
    contactInfo: "contact@healthsummit.com",
    notes: "Keynote speaker confirmations pending.",
    loadingZones: {
      outside: "Main Dock Area",
      inside: "Stage Entrance"
    },
    squareFootage: {
      outside: 4000,
      inside: 18000
    }
  },
  {
    id: 4,
    name: "Annual Marketing Workshop",
    status: "completed",
    date: "2025-03-15",
    vendors: [8],
    tasks: [401],
    budget: 45000,
    guests: 80,
    venueName: "Marketing Suites",
    contactInfo: "info@marketingworkshop.com",
    notes: "Workshop materials distributed.",
    loadingZones: {
      outside: "Side Door",
      inside: "Workshop Rooms"
    },
    squareFootage: {
      outside: 2500,
      inside: 9000
    }
  },
  {
    id: 5,
    name: "End of Year Celebration",
    status: "cancelled",
    date: "2025-12-20",
    vendors: [],
    tasks: [],
    budget: 0,
    guests: 0,
    venueName: "",
    contactInfo: "",
    notes: "Event cancelled due to budget constraints.",
    loadingZones: {
      outside: "",
      inside: ""
    },
    squareFootage: {
      outside: 0,
      inside: 0
    }
  }

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
