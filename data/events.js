export const events = [
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
];
