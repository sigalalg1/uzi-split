import React, { useEffect, useState } from "react";

// ==== Types ====
type Currency = "₪" | "$" | "€";

type Participant = {
  name: string;
  selected: boolean;
  percentage: string; // keep as string for easy input; can be "" or a number-like string
};

type SavedParticipant = {
  name: string;
  percentage: string; // stored only for selected participants
};

type Expense = {
  id: number;
  payer: string;
  amount: number;
  currency: Currency;
  participants: SavedParticipant[];
  createdAt: string; // ISO
};

// ==== Constants ====
const STORAGE_KEY = "uzisplit:expenses";

// ==== Component ====
export default function App() {
  // Form state
  const [payer, setPayer] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("₪");
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "Family A", selected: false, percentage: "" },
    { name: "Family B", selected: false, percentage: "" },
    { name: "Family C", selected: false, percentage: "" },
    { name: "Family D", selected: false, percentage: "" },
    { name: "Family E", selected: false, percentage: "" },
  ]);

  // Saved expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          // naive validation
          setExpenses(parsed as Expense[]);
        }
      }
    } catch (e) {
      console.warn("Failed to read saved expenses", e);
    }
  }, []);

  // Persist to localStorage whenever expenses change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Failed to save expenses", e);
    }
  }, [expenses]);

  // Handlers
  const handleParticipantToggle = (index: number): void => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  const handleParticipantPercent = (index: number, value: string): void => {
    // Allow empty or numeric input (including decimals)
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setParticipants((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], percentage: value };
        return next;
      });
    }
  };

  const resetForm = (): void => {
    setPayer("");
    setAmount("");
    setCurrency("₪");
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, selected: false, percentage: "" }))
    );
  };

  const handleSubmit = (): void => {
    const selected = participants.filter((p) => p.selected);

    // Basic validation
    if (!payer.trim()) {
      alert("Please enter who paid (family name).");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (selected.length === 0) {
      alert("Please select at least one participating family.");
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      payer: payer.trim(),
      amount: amt,
      currency,
      participants: selected.map((p) => ({
        name: p.name,
        percentage: p.percentage, // may be "" if not specified
      })),
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    resetForm();
  };

  const handleClearAll = (): void => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Clear all saved expenses?")) {
      setExpenses([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // ---- Simple inline styles (works even if Tailwind isn't set up) ----
  const wrap: React.CSSProperties = { maxWidth: 560, width: "100%", margin: "0 auto" };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: 6,
  };
  const sectionTitle: React.CSSProperties = { fontWeight: 600, margin: "8px 0" };
  const button: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#fff",
  };
  const primary: React.CSSProperties = {
    ...button,
    color: "#fff",
    background: "#2563eb",
    border: "none",
  };

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <div style={wrap}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Uzi Split</h1>

        {/* --- Form --- */}
        <div style={{ display: "grid", gap: 10 }}>
          <input
            type="text"
            placeholder="Who paid? (Family name)"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            style={inputStyle}
          >
            <option value="₪">₪ (Shekel)</option>
            <option value="$">$ (Dollar)</option>
            <option value="€">€ (Euro)</option>
          </select>

          <div>
            <div style={sectionTitle}>Who participated:</div>
            {participants.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <input
                  id={`p_${i}`}
                  type="checkbox"
                  checked={p.selected}
                  onChange={() => handleParticipantToggle(i)}
                />
                <label htmlFor={`p_${i}`} style={{ flex: 1 }}>
                  {p.name}
                </label>
                {p.selected && (
                  <input
                    type="number"
                    placeholder="%"
                    value={p.percentage}
                    onChange={(e) => handleParticipantPercent(i, e.target.value)}
                    style={{ ...inputStyle, width: 80 }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} style={primary}>
              Add Expense
            </button>
            <button onClick={handleClearAll} style={button}>
              Clear saved
            </button>
          </div>
        </div>

        {/* --- List --- */}
        <div style={{ marginTop: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Expenses
          </h2>
          {expenses.length === 0 ? (
            <p style={{ color: "#666" }}>
              No expenses yet. Add your first one above.
            </p>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <p>
                  <strong>{exp.payer}</strong> paid{" "}
                  <strong>
                    {exp.amount} {exp.currency}
                  </strong>{" "}
                  <span style={{ color: "#888", fontSize: 12 }}>
                    — {new Date(exp.createdAt).toLocaleString()}
                  </span>
                </p>
                <p style={{ fontSize: 14 }}>
                  Shared by:
                  {exp.participants.map((pp, idx) => (
                    <span key={idx}>
                      {" "}
                      {pp.name}
                      {pp.percentage && ` (${pp.percentage}%)`}
                      {idx < exp.participants.length - 1 ? "," : ""}
                    </span>
                  ))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
