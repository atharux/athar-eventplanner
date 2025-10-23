import React from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-4">
      <input
        type="search"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Search"
      />
    </div>
  );
}
