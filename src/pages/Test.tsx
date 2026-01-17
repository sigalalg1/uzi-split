import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { testData } from "../data/tests";
import { TestLevel } from "../types/test";

export default function Test() {
  const navigate = useNavigate();
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(
    new Set([10])
  );

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const handleTestClick = (url: string) => {
    navigate(url);
  };

  const handleBack = () => {
    navigate("/");
  };

  // Styles
  const container: React.CSSProperties = {
    minHeight: "calc(100vh - 70px)",
    padding: 16,
  };

  const header: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginBottom: 30,
    gap: 20,
  };

  const backButton: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,
  };

  const title: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 700,
    color: "#2563eb",
    margin: 0,
  };

  const treeContainer: React.CSSProperties = {
    maxWidth: 800,
    margin: "0 auto",
  };

  const levelContainer: React.CSSProperties = {
    marginBottom: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  };

  const levelHeader: React.CSSProperties = {
    padding: "16px 20px",
    background: "#f3f4f6",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    fontSize: 18,
    userSelect: "none",
  };

  const levelHeaderHover: React.CSSProperties = {
    ...levelHeader,
    background: "#e5e7eb",
  };

  const testList: React.CSSProperties = {
    padding: "10px 0",
    background: "#fff",
  };

  const testItem: React.CSSProperties = {
    padding: "12px 40px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const testItemHover: React.CSSProperties = {
    ...testItem,
    background: "#f9fafb",
  };

  const testIcon: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2563eb",
  };

  const testText: React.CSSProperties = {
    fontSize: 16,
    color: "#374151",
  };

  const arrow: React.CSSProperties = {
    fontSize: 14,
    transition: "transform 0.2s",
  };

  return (
    <div style={container}>
      <div style={header}>
        <button style={backButton} onClick={handleBack}>
          ← Back
        </button>
        <h1 style={title}>Math Tests</h1>
      </div>

      <div style={treeContainer}>
        {testData.map((levelData: TestLevel) => {
          const isExpanded = expandedLevels.has(levelData.level);

          return (
            <div key={levelData.level} style={levelContainer}>
              <div
                style={levelHeader}
                onClick={() => toggleLevel(levelData.level)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f3f4f6")
                }
              >
                <span>Level {levelData.level}</span>
                <span
                  style={{
                    ...arrow,
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  ▶
                </span>
              </div>

              {isExpanded && (
                <div style={testList}>
                  {levelData.tests.map((test) => (
                    <div
                      key={test.name}
                      style={testItem}
                      onClick={() => handleTestClick(test.url)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <div style={testIcon}></div>
                      <span style={testText}>{test.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


