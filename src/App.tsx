import React, { useEffect, useState } from "react";

// ==== Types ====
type Currency = "₪" | "$" | "€";
type SplitMode = "equal" | "percent" | "people";

type Participant = {
  name: string;
  selected: boolean;
  percentage: string; // for splitMode = "percent"
  people: string; // for splitMode = "people"
};

type SavedShare = {
  name: string;
  shareAmount: number;
  percentage?: number;
  people?: number;
};

type Expense = {
  id: number;
  payer: string;
  amount: number;
  currency: Currency;
  splitMode: SplitMode;
  shares: SavedShare[];
  createdAt: string;
};

// ==== Constants ====
const STORAGE_KEY = "uzisplit:expenses";
const FAMILIES = ["אלגרנטי", "כפיר", "קורן", "גורודצקי"];

// ==== Helpers ====
const round2 = (n: number) => Math.round(n * 100) / 100;

// ==== Component ====
export default function App() {
  const [payer, setPayer] = useState<string>(FAMILIES[0]);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("₪");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [participants, setParticipants] = useState<Participant[]>(
    FAMILIES.map((name) => ({ name, selected: false, percentage: "", people: "" }))
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Expense[];
        if (Array.isArray(parsed)) setExpenses(parsed);
      } catch {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const handleParticipantToggle = (index: number) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  const handleParticipantPercent = (index: number, value: string) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setParticipants((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], percentage: value };
        return next;
      });
    }
  };

  const handleParticipantPeople = (index: number, value: string) => {
    if (value === "" || /^[0-9]*$/.test(value)) {
      setParticipants((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], people: value };
        return next;
      });
    }
  };

  const resetForm = () => {
    setPayer(FAMILIES[0]);
    setAmount("");
    setCurrency("₪");
    setSplitMode("equal");
    setParticipants(FAMILIES.map((name) => ({ name, selected: false, percentage: "", people: "" })));
  };

  const computeShares = (amt: number, mode: SplitMode, selected: Participant[]): SavedShare[] | null => {
    if (mode === "equal") {
      const base = round2(amt / selected.length);
      const shares = selected.map((p) => ({ name: p.name, shareAmount: base }));
      const drift = round2(amt - shares.reduce((s, x) => s + x.shareAmount, 0));
      if (shares.length) shares[shares.length - 1].shareAmount = round2(shares[shares.length - 1].shareAmount + drift);
      return shares;
    }
    if (mode === "percent") {
      const nums = selected.map((p) => Number(p.percentage));
      if (Math.abs(nums.reduce((s, n) => s + n, 0) - 100) > 0.01) return null;
      const shares = selected.map((p) => {
        const pct = Number(p.percentage) || 0;
        return { name: p.name, percentage: pct, shareAmount: round2((pct / 100) * amt) };
      });
      const drift = round2(amt - shares.reduce((s, x) => s + x.shareAmount, 0));
      if (shares.length) shares[shares.length - 1].shareAmount = round2(shares[shares.length - 1].shareAmount + drift);
      return shares;
    }
    if (mode === "people") {
      const counts = selected.map((p) => Number(p.people));
      const totalPeople = counts.reduce((s, n) => s + n, 0);
      if (totalPeople <= 0) return null;
      const shares = selected.map((p) => {
        const c = Number(p.people);
        return { name: p.name, people: c, shareAmount: round2((c / totalPeople) * amt) };
      });
      const drift = round2(amt - shares.reduce((s, x) => s + x.shareAmount, 0));
      if (shares.length) shares[shares.length - 1].shareAmount = round2(shares[shares.length - 1].shareAmount + drift);
      return shares;
    }
    return null;
  };

  const handleSubmit = () => {
    const selected = participants.filter((p) => p.selected);
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    if (!selected.length) return alert("Select at least one family");

    const shares = computeShares(Number(amount), splitMode, selected);
    if (!shares) return alert("Invalid split data");

    const newExpense: Expense = {
      id: Date.now(),
      payer,
      amount: Number(amount),
      currency,
      splitMode,
      shares,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    resetForm();
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all saved expenses?")) {
      setExpenses([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ---- styles
  const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 };
  const sectionTitle: React.CSSProperties = { fontWeight: 600, margin: "8px 0" };
  const button: React.CSSProperties = { padding: "10px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer" };
  const primary: React.CSSProperties = { ...button, color: "#fff", background: "#2563eb", border: "none" };
  const radioRow: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" };

  return (
    <div style={{ padding: 16 }}>
      <div style={wrap}>
        <h1>Uzi Split</h1>

        {/* --- Form --- */}
        <div style={{ display: "grid", gap: 10 }}>
          <select value={payer} onChange={(e) => setPayer(e.target.value)} style={inputStyle}>
            {FAMILIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />

          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} style={inputStyle}>
            <option value="₪">₪ (Shekel)</option>
            <option value="$">$ (Dollar)</option>
            <option value="€">€ (Euro)</option>
          </select>

          <div>
            <div style={sectionTitle}>How to split:</div>
            <div style={radioRow}>
              <label>
                <input type="radio" value="equal" checked={splitMode === "equal"} onChange={() => setSplitMode("equal")} /> Equal
              </label>
              <label>
                <input type="radio" value="percent" checked={splitMode === "percent"} onChange={() => setSplitMode("percent")} /> %
              </label>
              <label>
                <input type="radio" value="people" checked={splitMode === "people"} onChange={() => setSplitMode("people")} /> People
              </label>
            </div>
          </div>

          <div>
            <div style={sectionTitle}>Participants:</div>
            {participants.map((p, i) => (
              <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <input type="checkbox" checked={p.selected} onChange={() => handleParticipantToggle(i)} />
                <span style={{ flex: 1 }}>{p.name}</span>
                {p.selected && splitMode === "percent" && (
                  <input type="number" placeholder="%" value={p.percentage} onChange={(e) => handleParticipantPercent(i, e.target.value)} style={{ ...inputStyle, width: 80 }} />
                )}
                {p.selected && splitMode === "people" && (
                  <input type="number" placeholder="people" value={p.people} onChange={(e) => handleParticipantPeople(i, e.target.value)} style={{ ...inputStyle, width: 100 }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} style={primary}>Add Expense</button>
            <button onClick={handleClearAll} style={button}>Clear saved</button>
          </div>
        </div>

        {/* --- List --- */}
        <div style={{ marginTop: 18 }}>
          <h2>Expenses</h2>
          {expenses.length === 0 ? (
            <p>No expenses yet</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <p>
                  <strong>{exp.payer}</strong> paid {exp.amount} {exp.currency} —{" "}
                  {new Date(exp.createdAt).toLocaleString()}
                </p>
                <p>Split mode: {exp.splitMode}</p>
                {exp.shares.map((s, idx) => (
                  <div key={idx}>
                    {s.name}: {s.shareAmount} {exp.currency}
                    {exp.percentage ? ` (${s.percentage}%)` : ""}
                    {exp.people ? ` (${s.people} people)` : ""}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
