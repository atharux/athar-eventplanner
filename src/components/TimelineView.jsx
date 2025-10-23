import React from "react";

export default function TimelineView({ events }) {
  if (events.length === 0)
    return <p className="text-gray-500 mt-4">No events to show</p>;

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          <strong>{event.name}</strong> - <em>{event.date}</em> -{" "}
          <span>{event.status}</span>
        </div>
      ))}
    </div>
  );
}
