import jsPDF from "jspdf";
import type { Tutorial } from "../functions/TutorialFunctions/tutorialFunctions";

/**
 * Export tutorial as PDF with NASA-level professional design
 */
export const exportTutorialToPDF = (tutorial: Tutorial) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const isAIGenerated =
    tutorial.tags?.includes("AI-generated") ||
    (tutorial as { isAIgenerated?: boolean }).isAIgenerated;

  // Color Palette - Professional NASA-inspired
  const colors = {
    primary: [0, 56, 101] as [number, number, number], // Deep Space Blue
    secondary: [232, 119, 34] as [number, number, number], // NASA Orange
    accent: [28, 117, 188] as [number, number, number], // Tech Blue
    dark: [17, 24, 39] as [number, number, number],
    gray: [75, 85, 99] as [number, number, number],
    lightGray: [156, 163, 175] as [number, number, number],
    success: [16, 185, 129] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
  };

  // Helper: Add text with word wrapping
  const addText = (
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    color: [number, number, number] = colors.dark
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      if (yPosition + fontSize / 2 > pageHeight - margin - 25) {
        addFooter();
        pdf.addPage();
        addPageHeader();
        yPosition = margin + 25;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize / 2 + 3;
    }
  };

  const addSpacing = (space: number) => {
    yPosition += space;
    if (yPosition > pageHeight - margin - 25) {
      addFooter();
      pdf.addPage();
      addPageHeader();
      yPosition = margin + 25;
    }
  };

  // Modern separator with gradient effect
  const addSeparator = (style: "full" | "accent" = "full") => {
    if (style === "full") {
      // Gradient line simulation
      for (let i = 0; i < 50; i++) {
        const alpha = i / 50;
        pdf.setDrawColor(
          colors.primary[0] + (colors.accent[0] - colors.primary[0]) * alpha,
          colors.primary[1] + (colors.accent[1] - colors.primary[1]) * alpha,
          colors.primary[2] + (colors.accent[2] - colors.primary[2]) * alpha
        );
        pdf.setLineWidth(0.3);
        pdf.line(
          margin + (maxWidth * i) / 50,
          yPosition,
          margin + (maxWidth * (i + 1)) / 50,
          yPosition
        );
      }
    } else {
      pdf.setDrawColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2]
      );
      pdf.setLineWidth(1.5);
      pdf.line(margin, yPosition, margin + 30, yPosition);
    }
    addSpacing(3);
  };

  // Enhanced footer with professional styling
  const addFooter = () => {
    const currentPage = pdf.getCurrentPageInfo().pageNumber;
    const footerY = pageHeight - 18;

    // Gradient footer background
    for (let i = 0; i < 15; i++) {
      const alpha = i / 15;
      pdf.setFillColor(
        255 - (255 - colors.primary[0]) * alpha * 0.1,
        255 - (255 - colors.primary[1]) * alpha * 0.1,
        255 - (255 - colors.primary[2]) * alpha * 0.1
      );
      pdf.rect(0, footerY + i, pageWidth, 1, "F");
    }

    // Top border accent
    pdf.setDrawColor(
      colors.secondary[0],
      colors.secondary[1],
      colors.secondary[2]
    );
    pdf.setLineWidth(1);
    pdf.line(0, footerY, pageWidth, footerY);

    // Footer content
    pdf.setFontSize(7);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("LearnCode AI", margin, footerY + 9);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    pdf.text("Advanced Learning Platform", margin + 20, footerY + 9);

    // Page number with circle
    const pageText = `${currentPage}`;
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.circle(pageWidth - margin - 5, footerY + 6, 4.5, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text(pageText, pageWidth - margin - 5, footerY + 8, {
      align: "center",
    });
  };

  // Page header for continuation pages
  const addPageHeader = () => {
    pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 15, pageWidth - margin, margin + 15);

    pdf.setFontSize(8);
    pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      tutorial.title.substring(0, 60) +
        (tutorial.title.length > 60 ? "..." : ""),
      margin,
      margin + 12
    );
  };

  // ============ COVER PAGE ============

  // Sophisticated geometric background pattern
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Helper function to draw polygons
  const drawPolygon = (
    points: [number, number][],
    style: "F" | "S" | "FD" = "S"
  ) => {
    if (points.length < 3) return;
    
    if (style === "F" || style === "FD") {
      // Fill the polygon
      pdf.path([
        { op: "m", c: [points[0][0], points[0][1]] },
        ...points.slice(1).map(p => ({ op: "l" as const, c: [p[0], p[1]] })),
        { op: "h" }
      ]);
      if (style === "F") {
        pdf.fillEvenOdd();
      } else {
        pdf.fillStrokeEvenOdd();
      }
    } else {
      // Stroke the polygon
      points.forEach((point, i) => {
        const nextPoint = points[(i + 1) % points.length];
        pdf.line(point[0], point[1], nextPoint[0], nextPoint[1]);
      });
    }
  };

  // Diagonal accent stripes
  for (let i = 0; i < 15; i++) {
    const opacity = 0.05 + i * 0.01;
    pdf.setFillColor(
      colors.primary[0] + 30 * opacity,
      colors.primary[1] + 60 * opacity,
      colors.primary[2] + 80 * opacity
    );
    const startX = -20 + i * 15;
    drawPolygon(
      [
        [startX, 0],
        [startX + 10, 0],
        [startX + pageWidth / 2, pageHeight],
        [startX + pageWidth / 2 - 10, pageHeight],
      ],
      "F"
    );
  }

  // Top accent bar
  pdf.setFillColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  pdf.rect(0, 0, pageWidth, 4, "F");

  // Modern hexagonal elements
  const drawHexagon = (
    x: number,
    y: number,
    size: number,
    fill: boolean = false
  ) => {
    const h = (size * Math.sqrt(3)) / 2;
    const points: [number, number][] = [
      [x + size, y],
      [x + size / 2, y - h],
      [x - size / 2, y - h],
      [x - size, y],
      [x - size / 2, y + h],
      [x + size / 2, y + h],
    ];
    if (fill) {
      drawPolygon(points, "F");
    } else {
      drawPolygon(points, "S");
    }
  };

  pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  pdf.setLineWidth(0.3);
  drawHexagon(pageWidth - 20, 40, 8);
  drawHexagon(pageWidth - 20, 60, 6);
  drawHexagon(15, pageHeight - 30, 5);
  drawHexagon(25, pageHeight - 45, 7);

  // Logo and branding
  pdf.setFillColor(255, 255, 255);
  pdf.circle(pageWidth / 2, 35, 18, "F");
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.circle(pageWidth / 2, 35, 15, "F");

  pdf.setFontSize(11);
  pdf.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  pdf.setFont("helvetica", "bold");
  pdf.text("</>", pageWidth / 2, 38, { align: "center" });

  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text("LearnCode AI", pageWidth / 2, 68, { align: "center" });

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "P R O F E S S I O N A L   L E A R N I N G   P L A T F O R M",
    pageWidth / 2,
    76,
    { align: "center" }
  );

  // Elegant title section
  const titleY = 110;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin - 5, titleY - 10, maxWidth + 10, 65, 2, 2, "F");

  // Title accent bar
  pdf.setFillColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  pdf.rect(margin - 5, titleY - 10, 4, 65, "F");

  pdf.setFontSize(22);
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.setFont("helvetica", "bold");
  let titleYPos = titleY;
  const titleLines = pdf.splitTextToSize(tutorial.title, maxWidth - 20);
  titleLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, titleYPos, { align: "center" });
    titleYPos += 10;
  });

  // Metadata badges
  const badgeY = titleYPos + 10;
  let badgeX = pageWidth / 2 - 70;

  // Language badge
  pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  pdf.roundedRect(badgeX, badgeY, 45, 12, 3, 3, "F");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text(tutorial.language.toUpperCase(), badgeX + 22.5, badgeY + 8, {
    align: "center",
  });
  badgeX += 50;

  // Difficulty badge
  const diffColors: { [key: string]: [number, number, number] } = {
    beginner: colors.success,
    intermediate: colors.warning,
    advanced: colors.danger,
  };
  const diffColor =
    diffColors[tutorial.difficulty.toLowerCase()] || colors.gray;
  pdf.setFillColor(diffColor[0], diffColor[1], diffColor[2]);
  pdf.roundedRect(badgeX, badgeY, 50, 12, 3, 3, "F");
  pdf.text(tutorial.difficulty.toUpperCase(), badgeX + 25, badgeY + 8, {
    align: "center",
  });
  badgeX += 55;

  // AI badge
  if (isAIGenerated) {
    pdf.setFillColor(139, 92, 246);
    pdf.roundedRect(badgeX, badgeY, 60, 12, 3, 3, "F");
    pdf.text("AI POWERED", badgeX + 30, badgeY + 8, { align: "center" });
  }

  // Concept
  if (tutorial.concept) {
    pdf.setFontSize(11);
    pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Concept: ${tutorial.concept}`, pageWidth / 2, badgeY + 22, {
      align: "center",
    });
  }

  // Info grid at bottom
  const gridY = pageHeight - 80;
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(pdf.GState({ opacity: 0.1 }));
  pdf.roundedRect(margin, gridY, maxWidth, 50, 2, 2, "F");
  pdf.setGState(pdf.GState({ opacity: 1 }));

  const cols = [
    { label: "FORMAT", value: "Interactive Tutorial" },
    { label: "LEVEL", value: tutorial.difficulty },
    { label: "LANGUAGE", value: tutorial.language },
  ];

  const colWidth = maxWidth / 3;
  cols.forEach((col, i) => {
    const x = margin + i * colWidth + colWidth / 2;
    pdf.setFontSize(8);
    pdf.setTextColor(
      colors.lightGray[0],
      colors.lightGray[1],
      colors.lightGray[2]
    );
    pdf.setFont("helvetica", "bold");
    pdf.text(col.label, x, gridY + 20, { align: "center" });
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.text(col.value, x, gridY + 32, { align: "center" });
  });

  // Date stamp
  pdf.setFontSize(8);
  pdf.setTextColor(
    colors.lightGray[0],
    colors.lightGray[1],
    colors.lightGray[2]
  );
  pdf.setFont("helvetica", "italic");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight - 15, {
    align: "center",
  });

  addFooter();

  // ============ CONTENT PAGES ============
  pdf.addPage();
  addPageHeader();
  yPosition = margin + 30;

  // Description Section
  if (tutorial.description && tutorial.description.trim().length > 0) {
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("DESCRIPTION", margin + 3, yPosition + 7);

    addSpacing(12);
    addSeparator("full");
    addSpacing(8);

    addText(tutorial.description, 10, "normal", colors.dark);
    addSpacing(15);
  }

  // Content Section
  if (tutorial.content && tutorial.content.length > 0) {
    // Section header
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("TUTORIAL CONTENT", margin + 3, yPosition + 7);

    addSpacing(12);
    addSeparator("full");
    addSpacing(8);

    const contentLines = tutorial.content.split("\n");

    for (const line of contentLines) {
      if (!line.trim()) {
        addSpacing(5);
        continue;
      }

      if (line.startsWith("## ")) {
        addSpacing(10);
        const headerText = line.replace("## ", "");

        // Modern section header
        // Draw accent line above the header
        pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin - 3, yPosition - 5, margin + 25, yPosition - 5);

        pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setGState(pdf.GState({ opacity: 0.1 }));
        pdf.roundedRect(margin - 3, yPosition - 3, maxWidth + 6, 14, 2, 2, "F");
        pdf.setGState(pdf.GState({ opacity: 1 }));

        addText(headerText, 13, "bold", colors.primary);
        addSpacing(5);
      } else if (line.startsWith("### ")) {
        addSpacing(6);
        pdf.setFillColor(
          colors.secondary[0],
          colors.secondary[1],
          colors.secondary[2]
        );
        pdf.circle(margin + 2, yPosition + 2, 1.5, "F");

        const subText = line.replace("### ", "");
        pdf.setFontSize(11);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFont("helvetica", "bold");
        const subLines = pdf.splitTextToSize(subText, maxWidth - 10);
        subLines.forEach((l: string) => {
          pdf.text(l, margin + 8, yPosition);
          yPosition += 6;
        });
        addSpacing(3);
      } else if (line.startsWith("#### ")) {
        addSpacing(4);
        addText("  › " + line.replace("#### ", ""), 10, "bold", colors.accent);
        addSpacing(2);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        pdf.setFillColor(
          colors.secondary[0],
          colors.secondary[1],
          colors.secondary[2]
        );
        pdf.rect(margin + 5, yPosition - 1, 2, 2, "F");

        pdf.setFontSize(9.5);
        pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        pdf.setFont("helvetica", "normal");
        const bulletLines = pdf.splitTextToSize(
          line.substring(2),
          maxWidth - 15
        );
        bulletLines.forEach((l: string) => {
          pdf.text(l, margin + 12, yPosition);
          yPosition += 5;
        });
      } else if (line.match(/^\d+\./)) {
        addText(`    ${line}`, 9.5, "normal", colors.gray);
      } else if (line.trim().startsWith("**") && line.trim().endsWith("**")) {
        addText(line.replace(/\*\*/g, ""), 10, "bold", colors.dark);
      } else {
        addText(line, 10, "normal", colors.dark);
      }
    }
  }

  // Code Examples Section
  if (tutorial.codeExamples && tutorial.codeExamples.length > 0) {
    addSpacing(15);

    // Section header
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("CODE EXAMPLES", margin + 3, yPosition + 7);

    addSpacing(12);
    addSeparator("full");
    addSpacing(8);

    tutorial.codeExamples.forEach((example, index) => {
      if (yPosition > pageHeight - 90) {
        addFooter();
        pdf.addPage();
        addPageHeader();
        yPosition = margin + 30;
      }

      // Example header with number badge
      pdf.setFillColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2]
      );
      pdf.roundedRect(margin, yPosition, 10, 10, 2, 2, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(index + 1), margin + 5, yPosition + 7, {
        align: "center",
      });

      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      pdf.text(example.title || "Code Example", margin + 13, yPosition + 7);
      yPosition += 13;

      if (example.description) {
        pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "italic");
        const descLines = pdf.splitTextToSize(
          example.description,
          maxWidth - 5
        );
        descLines.forEach((l: string) => {
          pdf.text(l, margin + 2, yPosition);
          yPosition += 5;
        });
        yPosition += 4;
      }

      // Premium code block
      const codeLines = example.code.split("\n");
      const codeHeight = codeLines.length * 4.5 + 10;

      if (yPosition + codeHeight > pageHeight - 35) {
        addFooter();
        pdf.addPage();
        addPageHeader();
        yPosition = margin + 30;
      }

      // Shadow effect
      pdf.setFillColor(0, 0, 0);
      pdf.setGState(pdf.GState({ opacity: 0.05 }));
      pdf.roundedRect(
        margin + 2,
        yPosition + 2,
        maxWidth - 2,
        codeHeight,
        4,
        4,
        "F"
      );
      pdf.setGState(pdf.GState({ opacity: 1 }));

      // Code container
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(margin, yPosition, maxWidth - 2, codeHeight, 4, 4, "F");

      // Top bar
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, yPosition, maxWidth - 2, 8, 4, 4, "F");
      pdf.rect(margin, yPosition + 4, maxWidth - 2, 4, "F");

      // Dots
      [colors.danger, colors.warning, colors.success].forEach((color, i) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.circle(margin + 6 + i * 5, yPosition + 4, 1.5, "F");
      });

      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont("helvetica", "normal");
      pdf.text(tutorial.language, margin + 23, yPosition + 5.5);

      // Line numbers sidebar
      pdf.setFillColor(22, 30, 46);
      pdf.rect(margin, yPosition + 8, 14, codeHeight - 8, "F");

      pdf.setFont("courier", "normal");
      pdf.setFontSize(7.5);

      codeLines.forEach((line, lineIndex) => {
        const lineY = yPosition + 13 + lineIndex * 4.5;

        // Line number
        pdf.setTextColor(71, 85, 105);
        pdf.text(String(lineIndex + 1).padStart(3, " "), margin + 2, lineY);

        // Code line with syntax-aware color
        let codeColor = [226, 232, 240] as [number, number, number]; // Default text
        if (
          line.includes("function") ||
          line.includes("const") ||
          line.includes("let") ||
          line.includes("var")
        ) {
          codeColor = [192, 132, 252] as [number, number, number]; // Keywords purple
        } else if (line.includes("//")) {
          codeColor = [100, 116, 139] as [number, number, number]; // Comments gray
        } else if (line.includes('"') || line.includes("'")) {
          codeColor = [134, 239, 172] as [number, number, number]; // Strings green
        }

        pdf.setTextColor(codeColor[0], codeColor[1], codeColor[2]);
        const codeLine = line.substring(0, 85);
        pdf.text(codeLine, margin + 16, lineY);
      });

      yPosition += codeHeight + 12;
      pdf.setFont("helvetica", "normal");
    });
  }

  // Notes Section
  if (tutorial.notes && tutorial.notes.length > 0) {
    addSpacing(15);

    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(14);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES", margin + 3, yPosition + 7);

    addSpacing(12);
    addSeparator("accent");
    addSpacing(8);

    tutorial.notes.forEach((note, index) => {
      // Note number badge
      pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.circle(margin + 3, yPosition + 2, 3, "F");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text((index + 1).toString(), margin + 3, yPosition + 3.5, { align: "center" });

      // Note text
      pdf.setFontSize(9.5);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont("helvetica", "normal");
      const noteLines = pdf.splitTextToSize(note, maxWidth - 15);
      noteLines.forEach((line: string) => {
        pdf.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
      addSpacing(6);
    });
  }

  // Tips Section
  if (tutorial.tips && tutorial.tips.length > 0) {
    addSpacing(15);

    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(14);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("TIPS", margin + 3, yPosition + 7);

    addSpacing(12);
    addSeparator("accent");
    addSpacing(8);

    tutorial.tips.forEach((tip) => {
      // Tip bullet
      pdf.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
      pdf.circle(margin + 3, yPosition + 2, 2, "F");

      // Tip text
      pdf.setFontSize(9.5);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont("helvetica", "normal");
      const tipLines = pdf.splitTextToSize(tip, maxWidth - 15);
      tipLines.forEach((line: string) => {
        pdf.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
      addSpacing(4);
    });
  }

  // Tags Section
  if (tutorial.tags && tutorial.tags.length > 0) {
    addSpacing(15);

    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin - 5, yPosition - 5, 5, 18, "F");

    pdf.setFontSize(14);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text("TAGS", margin + 3, yPosition + 7);

    addSpacing(12);

    let tagX = margin;
    let tagY = yPosition;

    tutorial.tags.forEach((tag) => {
      const tagWidth = pdf.getTextWidth(tag) + 12;

      if (tagX + tagWidth > pageWidth - margin) {
        tagX = margin;
        tagY += 12;
      }

      pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setGState(pdf.GState({ opacity: 0.15 }));
      pdf.roundedRect(tagX, tagY, tagWidth, 9, 2, 2, "F");
      pdf.setGState(pdf.GState({ opacity: 1 }));

      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(tagX, tagY, tagWidth, 9, 2, 2);

      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text(tag, tagX + 6, tagY + 6.5);

      tagX += tagWidth + 6;
    });

    yPosition = tagY + 15;
  }

  // Final Copyright Section
  addSpacing(20);

  if (yPosition > pageHeight - 80) {
    addFooter();
    pdf.addPage();
    addPageHeader();
    yPosition = margin + 30;
  }

  addSeparator("full");
  addSpacing(10);

  // Professional attribution box
  const attrHeight = isAIGenerated ? 50 : 40;
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin - 5, yPosition, maxWidth + 10, attrHeight, 3, 3, "F");
  pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin - 5, yPosition, maxWidth + 10, attrHeight, 3, 3);

  // Copyright symbol accent
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.circle(margin + 8, yPosition + 12, 5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("©", margin + 8, yPosition + 14, { align: "center" });

  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.setFontSize(11);
  pdf.text(
    `${new Date().getFullYear()} LearnCode AI Technologies`,
    margin + 18,
    yPosition + 13
  );

  yPosition += 20;
  pdf.setFontSize(8);
  pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "All rights reserved. This tutorial is licensed for educational purposes.",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  yPosition += 6;
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  pdf.text(
    "www.LearnCode AI.com  |  support@LearnCode AI.com",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  if (isAIGenerated) {
    yPosition += 10;
    pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setGState(pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(margin + 5, yPosition - 4, maxWidth - 10, 14, 2, 2, "F");
    pdf.setGState(pdf.GState({ opacity: 1 }));

    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("AI-POWERED CONTENT", pageWidth / 2, yPosition + 2, {
      align: "center",
    });
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    pdf.text(
      "This tutorial was generated using advanced AI technology and professionally reviewed.",
      pageWidth / 2,
      yPosition + 8,
      { align: "center" }
    );
  }

  // Add footer to all pages except the cover
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    // Footer is already added during page creation
  }

  // Return to last page
  pdf.setPage(totalPages);

  // Generate clean filename
  const cleanTitle = (tutorial.concept || tutorial.title)
    .substring(0, 40)
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const fileName = `LearnCode AI_${cleanTitle}_${tutorial.language}${
    isAIGenerated ? "_AI" : ""
  }_${new Date().toISOString().split("T")[0]}.pdf`;

  // Save the PDF
  pdf.save(fileName);
};

