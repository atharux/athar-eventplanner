const [statusFilter, setStatusFilter] = React.useState("all");
const [dateRange, setDateRange] = React.useState([null, null]);

const filteredEvents = events.filter(event => 
  (statusFilter === "all" || event.status === statusFilter) && 
  (dateRange[0] === null || new Date(event.date) >= dateRange[0]) &&
  (dateRange[1] === null || new Date(event.date) <= dateRange[1])
);
