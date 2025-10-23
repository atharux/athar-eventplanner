import React, { useState } from "react";

const STEPS = [
  "Venue & Date",
  "Vendors",
  "Guest List",
  "Staffing",
  "Timeline",
  "Advertising",
];

function ProgressBar({ currentStep }) {
  const percent = ((currentStep + 1) / STEPS.length) * 100;
  return (
    <div className="w-full bg-gray-300 rounded h-3 mb-4">
      <div
        className="bg-blue-600 h-3 rounded transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function VenueDateStep({ data, onChange }) {
  return (
    <div>
      <label className="block mb-2">
        Venue Name:
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={data.venueName || ""}
          onChange={e => onChange({ ...data, venueName: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        Event Date:
        <input
          type="date"
          className="border px-2 py-1 rounded w-full"
          value={data.date || ""}
          onChange={e => onChange({ ...data, date: e.target.value })}
        />
      </label>
    </div>
  );
}

function VendorsStep({ data, onChange }) {
  const vendorOptions = ["Catering", "Entertainment", "Flower", "Photography"];
  return (
    <div>
      <label className="block mb-2">Select Vendors:</label>
      {vendorOptions.map(vendor => (
        <label key={vendor} className="inline-block mr-4">
          <input
            type="checkbox"
            checked={data.vendors?.includes(vendor) || false}
            onChange={e => {
              const selected = data.vendors || [];
              if (e.target.checked) {
                onChange({ ...data, vendors: [...selected, vendor] });
              } else {
                onChange({
                  ...data,
                  vendors: selected.filter(v => v !== vendor),
                });
              }
            }}
          />
          <span className="ml-1">{vendor}</span>
        </label>
      ))}
    </div>
  );
}

function GuestListStep({ data, onChange }) {
  return (
    <div>
      <label className="block mb-2">
        Number of Guests:
        <input
          type="number"
          min="0"
          className="border px-2 py-1 rounded w-full"
          value={data.guests || ""}
          onChange={e => onChange({ ...data, guests: parseInt(e.target.value) })}
        />
      </label>
    </div>
  );
}

function StaffingStep({ data, onChange }) {
  return (
    <div>
      <label className="block mb-2">
        Number of Staff:
        <input
          type="number"
          min="0"
          className="border px-2 py-1 rounded w-full"
          value={data.staff || ""}
          onChange={e => onChange({ ...data, staff: parseInt(e.target.value) })}
        />
      </label>
    </div>
  );
}

function TimelineStep({ data, onChange }) {
  return (
    <div>
      <label className="block mb-2">
        Timeline Notes:
        <textarea
          className="border px-2 py-1 rounded w-full"
          value={data.timeline || ""}
          onChange={e => onChange({ ...data, timeline: e.target.value })}
        />
      </label>
    </div>
  );
}

function AdvertisingStep({ data, onChange }) {
  return (
    <div>
      <label className="block mb-2">
        Advertising Budget:
        <input
          type="number"
          min="0"
          className="border px-2 py-1 rounded w-full"
          value={data.adBudget || ""}
          onChange={e => onChange({ ...data, adBudget: parseInt(e.target.value) })}
        />
      </label>
    </div>
  );
}

export default function EventCreationWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const StepComponents = [
    VenueDateStep,
    VendorsStep,
    GuestListStep,
    StaffingStep,
    TimelineStep,
    AdvertisingStep,
  ];

  const CurrentStepComponent = StepComponents[currentStep];

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">Event Creation - {STEPS[currentStep]}</h2>
      <ProgressBar currentStep={currentStep} />
      <CurrentStepComponent data={formData} onChange={setFormData} />
      <div className="mt-4 flex justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={goNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
