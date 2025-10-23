import React from "react";

const STEPS = [
  { id: "vendors", label: "Vendors" },
  { id: "venue", label: "Venue" },
  { id: "staff", label: "Staff" },
  { id: "timeline", label: "Timeline" },
  { id: "advertising", label: "Advertising" },
];

export default function EventCreationProgress({ completedSteps }) {
  const totalSteps = STEPS.length;
  const completedCount = STEPS.filter(step =>
    completedSteps.includes(step.id)
  ).length;

  const progressPercent = (completedCount / totalSteps) * 100;

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between mb-2 text-xs font-semibold text-gray-600">
        {STEPS.map(step => (
          <div
            key={step.id}
            className={`flex-1 text-center ${
              completedSteps.includes(step.id) ? "text-green-600" : ""
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
      <div className="relative h-3 rounded bg-gray-300 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-3 rounded bg-green-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-1 text-sm text-gray-700">
        {completedCount} of {totalSteps} completed
      </div>
    </div>
  );
}
