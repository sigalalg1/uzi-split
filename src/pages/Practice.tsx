import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { testData } from "../data/tests";
import { TestSubject } from "../types/test";

export default function Practice() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(["addition", "multiplication", "order-of-operations", "fractions"])
  );

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const handleTestClick = (url: string) => {
    navigate(url);
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
        <h1 style={title}>{t("practicePage.title")}</h1>
      </div>

      <div style={treeContainer}>
        {testData.map((subjectData: TestSubject) => {
          const isExpanded = expandedSubjects.has(subjectData.subject);

          return (
            <div key={subjectData.subject} style={levelContainer}>
              <div
                style={levelHeader}
                onClick={() => toggleSubject(subjectData.subject)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f3f4f6")
                }
              >
                <span>{t(subjectData.subjectKey)}</span>
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
                  {subjectData.tests.map((test) => (
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
                      <span style={testText}>{t(test.text)}</span>
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


