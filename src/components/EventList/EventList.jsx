import React from "react";

export default function EventList({ events, onSelectEvent }) {
  if (events.length === 0)
    return <p className="text-gray-500 mt-4">No events found</p>;

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="border border-gray-300 rounded-md px-4 py-3 bg-white shadow-sm cursor-pointer"
          onClick={() => onSelectEvent(event)}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelectEvent(event);
          }}
        >
          <h3 className="text-lg font-bold">{event.name}</h3>
          <p>Date: {event.date}</p>
          <p>Status: {event.status}</p>
          <p>Budget: ${event.budget.toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
