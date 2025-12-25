import React from 'react';

/**
 * Formats markdown-style text into JSX elements for display
 * Supports headings (##, ###), bullet points, bold text, and line breaks
 */
export const formatMarkdownText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  try {
    const elements = text.split('\n').map((line, index) => {
      // Handle H2 headings (##)
      if (line.startsWith('## ')) {
        return (
          <h2
            key={index}
            className="text-lg font-bold text-gray-800 mt-4 mb-2 pb-1 border-b border-gray-300"
          >
            {line.replace('## ', '')}
          </h2>
        );
      }
      
      // Handle H3 headings (###)
      if (line.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-base font-semibold text-gray-700 mt-3 mb-2 flex items-center gap-1"
          >
            <span className="text-blue-500">▸</span>
            {line.replace('### ', '')}
          </h3>
        );
      }
      
      // Handle special bullet points with bold titles (- **Title**: content)
      if (line.startsWith('- **') && line.includes('**:')) {
        const match = line.match(/- \*\*(.*?)\*\*:(.*)/);
        if (match) {
          return (
            <div
              key={index}
              className="ml-4 text-gray-700 bg-blue-50 py-1 px-2 rounded mb-1 text-sm"
            >
              <strong className="text-blue-700">
                {match[1]}
              </strong>
              :
              <span className="text-gray-800">
                {match[2]}
              </span>
            </div>
          );
        }
      }
      
      // Handle regular bullet points (-)
      if (line.startsWith('- ')) {
        return (
          <div
            key={index}
            className="ml-4 text-gray-700 py-1 text-sm flex items-start gap-2"
          >
            <span className="text-blue-500 mt-1">•</span>
            <span>{line.replace('- ', '')}</span>
          </div>
        );
      }
      
      // Handle numbered lists (1., 2., etc.)
      if (line.match(/^\d+\./)) {
        return (
          <div
            key={index}
            className="ml-4 text-gray-700 py-1 text-sm"
          >
            {line}
          </div>
        );
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      
      // Handle bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p
            key={index}
            className="text-gray-700 mb-2 text-sm leading-relaxed"
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong
                  key={i}
                  className="text-gray-900 font-semibold"
                >
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      
      // Handle regular paragraphs
      return (
        <p
          key={index}
          className="text-gray-700 mb-2 text-sm leading-relaxed"
        >
          {line}
        </p>
      );
    });

    return <div className="space-y-1">{elements}</div>;
  } catch (error) {
    console.error('Error formatting markdown text:', error);
    // Fallback to plain text display
    return <p className="text-gray-700 text-sm">{text}</p>;
  }
};
