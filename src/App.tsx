import React, { useState, useEffect } from "react";

const STORAGE_KEY = "uzisplit:expenses";

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

  // Load saved expenses on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch (e) {
      console.warn("Failed to read saved expenses", e);
    }
  }, []);

  // Persist expenses whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Failed to save expenses", e);
    }
  }, [expenses]);

  const handleParticipantChange = (index) => {
    const updated = [...participants];
    updated[index].selected = !updated[index].selected;
    setParticipants(updated);
  };

  const handlePercentageChange = (index, value) => {
    const updated = [...participants];
    updated[index].percentage = value;
    setParticipants(updated);
  };

  const handleSubmit = () => {
    const selectedParticipants = participants.filter((p) => p.selected);

    // basic validation
    if (!payer.trim()) {
      alert("Please enter who paid (family name).");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (selectedParticipants.length === 0) {
      alert("Please select at least one participating family.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      payer: payer.trim(),
      amount: amt,
      currency,
      participants: selectedParticipants.map((p) => ({
        name: p.name,
        percentage: p.percentage,
      })),
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Reset form
    setPayer("");
    setAmount("");
    setCurrency("₪");
    setParticipants(
      participants.map((p) => ({ ...p, selected: false, percentage: "" }))
    );
  };

  const handleClearAll = () => {
    if (confirm("Clear all saved expenses?")) {
      setExpenses([]);
      try { localStorage.removeItem(STORAGE