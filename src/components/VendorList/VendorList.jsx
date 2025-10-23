import React from "react";

export default function VendorList({ vendors, toggleFavorite }) {
  if (vendors.length === 0)
    return <p className="text-gray-500 mt-4">No vendors found</p>;

  return (
    <ul className="space-y-3">
      {vendors.map((vendor) => (
        <li
          key={vendor.id}
          className="border border-gray-300 rounded-md px-4 py-3 flex justify-between items-center bg-white shadow-sm"
        >
          <div>
            <h3 className="text-lg font-bold">{vendor.name}</h3>
            <p>Category: {vendor.category}</p>
          </div>
          <button
            className={`px-3 py-1 rounded-md text-sm font-semibold ${
              vendor.favorite ? "bg-yellow-300" : "bg-gray-200"
            }`}
            onClick={() => toggleFavorite(vendor.id)}
          >
            {vendor.favorite ? "Unfavorite" : "Favorite"}
          </button>
        </li>
      ))}
    </ul>
  );
}
