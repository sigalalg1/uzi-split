import React, { useState } from "react";

export default function App() {
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("₪");
  const [participants, setParticipants] = useState([
    { name: "Family A", selected: false, percentage: "" },
    { name: "Family B", selected: false, percentage: "" },
    { name: "Family C", selected: false, percentage: "" },
    { name: "Family D", selected: false, percentage: "" },
    { name: "Family E", selected: false, percentage: "" },
  ]);
  const [expenses, setExpenses] = useState([]);

  
  const handlePercentageChange = (index, value) => {
    const updated = [...participants];
    updated[index].percentage = value;
    setParticipants(updated);
  };

  const handleSubmit = () => {
    const selectedParticipants = participants.filter(p => p.selected);
    const newExpense = {
      payer,
      amount,
      currency,
      participants: selectedParticipants.map(p => ({
        name: p.name,
        percentage: p.percentage
      }))
    };
    setExpenses([...expenses, newExpense]);

    // Reset form
    setPayer("");
    setAmount("");
    setCurrency("₪");
    setParticipants(participants.map(p => ({ ...p, selected: false, percentage: "" })));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Uzi Split</h1>

      <input
        type="text"
        placeholder="Who paid? (Family name)"
        value={payer}
        onChange={(e) => setPayer(e.target.value)}
        className="p-2 border rounded w-full max-w-md"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded w-full max-w-md"
      />

      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="p-2 border rounded w-full max-w-md"
      >
        <option value="₪">₪ (Shekel)</option>
        <option value="$">$ (Dollar)</option>
        <option value="€">€ (Euro)</option>
      </select>

      <div className="w-full max-w-md">
        <p className="font-semibold mt-4">Who participated:</p>
        {participants.map((participant, index) => (
          <div key={participant.name} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={participant.selected}
              onChange={() => handleParticipantChange(index)}
            />
            <label className="flex-1">{participant.name}</label>
            {participant.selected && (
              <input
                type="number"
                placeholder="%"
                value={participant.percentage}
                onChange={(e) => handlePercentageChange(index, e.target.value)}
                className="p-1 border rounded w-16"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Expense
      </button>

      <div className="w-full max-w-md mt-6">
        <h2 className="text-xl font-semibold mb-2">Expenses:</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses added yet.</p>
        ) : (
          expenses.map((exp, i) => (
            <div key={i} className="border rounded p-3 mb-3">
              <p><strong>{exp.payer}</strong> paid <strong>{exp.amount} {exp.currency}</strong></p>
              <p className="text-sm">Shared by:
                {exp.participants.map((p, idx) => (
                  <span key={idx}> {p.name}{p.percentage && ` (${p.percentage}%)`}{idx < exp.participants.length - 1 ? "," : ""}</span>
                ))}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
