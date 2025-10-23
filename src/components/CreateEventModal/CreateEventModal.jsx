import React, { useState } from "react";

export default function CreateEventModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date || !budget) return;
    onCreate({ id: Date.now(), name, date, budget: Number(budget), status: "planning" });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-md p-6 shadow-lg max-w-sm w-full"
      >
        <h2 className="mb-4 text-xl font-semibold">Create New Event</h2>
        <label className="block mb-2">
          Name
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="block mb-2">
          Date
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label className="block mb-4">
          Budget ($)
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2 mt-1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            min={1}
          />
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
