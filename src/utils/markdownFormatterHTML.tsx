import React from "react";

/**
 * Simple and reliable markdown formatter
 */
export const formatMarkdownText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split text into lines and process each one
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Handle H3 headings (###)
    if (trimmedLine.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${index}`}
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#e5e7eb",
            margin: "12px 0 6px 0",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ color: "#8b5cf6" }}>▸</span>
          {trimmedLine.replace("### ", "")}
        </h3>
      );
      return;
    }

    // Handle H2 headings (##)
    if (trimmedLine.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${index}`}
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#f3f4f6",
            margin: "16px 0 8px 0",
            paddingBottom: "4px",
            borderBottom: "1px solid #2a3050",
          }}
        >
          {trimmedLine.replace("## ", "")}
        </h2>
      );
      return;
    }

    // Handle empty lines
    if (trimmedLine === "") {
      elements.push(<div key={`space-${index}`} style={{ height: "8px" }} />);
      return;
    }

    // Handle lines with bold text
    if (line.includes("**")) {
      const parts = line.split("**");
      const formattedParts = parts.map((part, i) => {
        if (i % 2 === 1) {
          // Odd indices are bold text
          return (
            <strong
              key={`bold-${index}-${i}`}
              style={{ fontWeight: "600", color: "#ffffff" }}
            >
              {part}
            </strong>
          );
        }
        return part;
      });

      elements.push(
        <p
          key={`p-${index}`}
          style={{
            margin: "4px 0",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#e5e7eb",
          }}
        >
          {formattedParts}
        </p>
      );
      return;
    }

    // Handle regular lines
    elements.push(
      <p
        key={`text-${index}`}
        style={{
          margin: "4px 0",
          fontSize: "14px",
          lineHeight: "1.5",
          color: "#e5e7eb",
        }}
      >
        {line}
      </p>
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>{elements}</div>
  );
};

// Keep the old component name for compatibility
export const MarkdownHTMLRenderer: React.FC<{ text: string }> = ({ text }) => {
  return <>{formatMarkdownText(text)}</>;
};
