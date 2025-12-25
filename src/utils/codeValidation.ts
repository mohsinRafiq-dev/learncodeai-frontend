/**
 * Code Validation Utilities
 * Real-time syntax checking for Python, JavaScript, and C++
 * Uses Monaco Editor's built-in validation for JavaScript
 */

import * as monaco from 'monaco-editor';

export interface ValidationError {
  message: string;
  line: number;
  column: number;
}

/**
 * Python syntax checker
 * Detects common syntax errors in Python code
 */
export const checkPythonSyntax = (code: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) return;

    // Check for missing colons at end of control structures
    if (
      trimmed.match(
        /^(if|elif|while|for|def|class|with|try|except|finally|else)\s+/
      ) &&
      !trimmed.endsWith(":")
    ) {
      errors.push({
        message: `SyntaxError: expected ":" at end of ${
          trimmed.split(/\s+/)[0]
        } statement`,
        line: lineNum,
        column: trimmed.length,
      });
    }

    // Check for potential invalid syntax patterns
    if (trimmed.match(/^\w+\s*=\s*\(\s*\)$/) && !trimmed.includes('tuple')) {
      errors.push({
        message: "SyntaxError: invalid assignment - empty parentheses",
        line: lineNum,
        column: 1,
      });
    }

    // Check for standalone identifiers (potential undefined variables)
    if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && 
        !trimmed.match(/^(True|False|None|self|__name__|__main__)$/)) {
      errors.push({
        message: `NameError: potential undefined variable '${trimmed}'`,
        line: lineNum,
        column: 1,
      });
    }

    // Check for unterminated string literals
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (
      singleQuotes % 2 !== 0 &&
      !line.includes('"""') &&
      !line.includes("'''")
    ) {
      errors.push({
        message: "SyntaxError: unterminated string literal (single quote)",
        line: lineNum,
        column: line.indexOf("'") + 1,
      });
    }

    if (
      doubleQuotes % 2 !== 0 &&
      !line.includes('"""') &&
      !line.includes("'''")
    ) {
      errors.push({
        message: "SyntaxError: unterminated string literal (double quote)",
        line: lineNum,
        column: line.indexOf('"') + 1,
      });
    }
  });

  return errors;
};

/**
 * JavaScript syntax checker using Monaco Editor's built-in validation
 * Reads existing Monaco markers instead of creating temporary models
 */
export const checkJavaScriptSyntax = async (
  code: string,
  editor?: monaco.editor.IStandaloneCodeEditor
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];
  
  try {
    // If we have an editor instance, get its existing markers
    if (editor) {
      const model = editor.getModel();
      if (model) {
        // Wait longer for Monaco's validation to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get all markers for this model from Monaco's built-in validation
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        console.log('Monaco markers found:', markers);
        
        // Convert Monaco markers to our ValidationError format
        markers.forEach(marker => {
          // Include errors and some important warnings
          if (marker.severity === monaco.MarkerSeverity.Error || 
              (marker.severity === monaco.MarkerSeverity.Warning && 
               (marker.message.includes('not defined') || 
                marker.message.includes('is not defined') ||
                marker.message.includes('Cannot find name')))) {
            errors.push({
              message: marker.message,
              line: marker.startLineNumber,
              column: marker.startColumn
            });
          }
        });
        
        // Always fall back to custom validation to supplement Monaco
        console.log('Getting additional errors from fallback validation');
        const fallbackErrors = checkJavaScriptSyntaxFallback(code);
        
        // Merge errors, avoiding duplicates
        fallbackErrors.forEach(fallbackError => {
          const isDuplicate = errors.some(existing => 
            existing.line === fallbackError.line && 
            existing.message.toLowerCase().includes(fallbackError.message.toLowerCase().split(':')[1]?.trim() || '')
          );
          if (!isDuplicate) {
            errors.push(fallbackError);
          }
        });
        
        return errors;
      }
    }

    // Fallback: try the old approach if no editor provided
    console.log('No editor provided, using fallback validation');
    return checkJavaScriptSyntaxFallback(code);
    
  } catch (e) {
    console.warn('Monaco validation failed, using fallback:', e);
    return checkJavaScriptSyntaxFallback(code);
  }
};

/**
 * Fallback JavaScript syntax checker
 * Basic validation when Monaco is not available
 */
export const checkJavaScriptSyntaxFallback = (code: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  try {
    new Function(code);
  } catch (e) {
    if (e instanceof SyntaxError) {
      errors.push({ 
        message: `SyntaxError: ${e.message}`, 
        line: 1, 
        column: 1 
      });
    }
  }

  // Additional basic checks
  const lines = code.split("\n");
  const definedVariables = new Set<string>();
  const builtInObjects = new Set(['console', 'window', 'document', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'parseInt', 'parseFloat', 'isNaN', 'undefined', 'null', 'true', 'false']);
  
  // First pass: collect defined variables
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Variable declarations
    const varMatch = trimmed.match(/(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (varMatch) {
      definedVariables.add(varMatch[1]);
    }
    
    // Function declarations
    const funcMatch = trimmed.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (funcMatch) {
      definedVariables.add(funcMatch[1]);
    }
    
    // Function parameters
    const paramMatch = trimmed.match(/function\s+\w+\s*\(([^)]*)\)/);
    if (paramMatch && paramMatch[1]) {
      const params = paramMatch[1].split(',').map(p => p.trim());
      params.forEach(param => {
        if (param && !param.includes('=')) {
          definedVariables.add(param);
        }
      });
    }
  });

  // Second pass: check for undefined variables
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*"))
      return;

    // Check for standalone identifiers (potential undefined variables)
    if (trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) && 
        !definedVariables.has(trimmed) && 
        !builtInObjects.has(trimmed)) {
      errors.push({
        message: `ReferenceError: '${trimmed}' is not defined`,
        line: lineNum,
        column: 1,
      });
    }
    
    // Remove strings from the line before checking for undefined variables
    let processedLine = line;
    // Remove string literals (both single and double quotes)
    processedLine = processedLine.replace(/"[^"]*"/g, '""');
    processedLine = processedLine.replace(/'[^']*'/g, "''");
    processedLine = processedLine.replace(/`[^`]*`/g, '``');
    
    // Remove object literal property keys (before colons in object literals)
    processedLine = processedLine.replace(/\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ :');
    processedLine = processedLine.replace(/,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, ', :');
    
    // Check for undefined variables in expressions (but not in strings, property access, method calls, or object keys)
    const identifierMatches = processedLine.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
    if (identifierMatches) {
      identifierMatches.forEach(identifier => {
        // Skip if it's part of object property access or method call
        const beforeIdentifier = processedLine.substring(0, processedLine.indexOf(identifier));
        const afterIdentifier = processedLine.substring(processedLine.indexOf(identifier) + identifier.length);
        
        // Skip if preceded by dot (property access) or followed by dot or parenthesis (method call)
        // Also skip if followed by colon (object literal key)
        if (beforeIdentifier.endsWith('.') || afterIdentifier.startsWith('.') || 
            afterIdentifier.startsWith('(') || afterIdentifier.trimStart().startsWith(':')) {
          return;
        }
        
        // Skip JavaScript keywords and defined variables
        if (!definedVariables.has(identifier) && 
            !builtInObjects.has(identifier) && 
            !identifier.match(/^(if|else|for|while|do|switch|case|default|break|continue|return|function|var|let|const|class|extends|import|export|from|as|new|this|super|static|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void)$/)) {
          
          const column = line.indexOf(identifier) + 1;
          // Avoid duplicate errors for the same variable on the same line
          const existingError = errors.find(e => e.line === lineNum && e.message.includes(identifier));
          if (!existingError) {
            errors.push({
              message: `ReferenceError: '${identifier}' is not defined`,
              line: lineNum,
              column: column,
            });
          }
        }
      });
    }

    // Check for unterminated strings
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    const backticks = (line.match(/`/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      errors.push({
        message: "SyntaxError: unterminated string literal (single quote)",
        line: lineNum,
        column: line.indexOf("'") + 1,
      });
    }

    if (doubleQuotes % 2 !== 0) {
      errors.push({
        message: "SyntaxError: unterminated string literal (double quote)",
        line: lineNum,
        column: line.indexOf('"') + 1,
      });
    }

    if (backticks % 2 !== 0) {
      errors.push({
        message: "SyntaxError: unterminated template literal",
        line: lineNum,
        column: line.indexOf("`") + 1,
      });
    }
  });

  return errors;
};

/**
 * C++ syntax checker
 * Detects common syntax errors in C++ code
 */
export const checkCppSyntax = (code: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lines = code.split("\n");

  let braceBalance = 0;
  let parenBalance = 0;
  const definedIdentifiers = new Set(['cout', 'cin', 'endl', 'string', 'int', 'float', 'double', 'char', 'bool', 'void', 'main', 'std', 'using', 'namespace', 'include', 'return', 'map']);
  
  // First pass: collect defined functions and variables
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Function definitions
    const funcMatch = trimmed.match(/(?:int|void|float|double|char|bool|string)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (funcMatch) {
      definedIdentifiers.add(funcMatch[1]);
    }
    
    // Variable declarations
    const varMatch = trimmed.match(/(?:int|float|double|char|bool|string)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (varMatch) {
      definedIdentifiers.add(varMatch[1]);
    }
  });

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip empty lines, comments, preprocessor directives
    if (
      !trimmed ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("#")
    )
      return;

    // Track brace and parentheses balance
    braceBalance += (line.match(/{/g) || []).length;
    braceBalance -= (line.match(/}/g) || []).length;
    parenBalance += (line.match(/\(/g) || []).length;
    parenBalance -= (line.match(/\)/g) || []).length;
    
    // Check for standalone identifiers (potential undefined variables)
    if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && 
        !definedIdentifiers.has(trimmed) && 
        !trimmed.match(/^(if|else|for|while|do|switch|case|default|break|continue|return|public|private|protected|class|struct|namespace|template|using|enum|typedef)$/)) {
      errors.push({
        message: `Error: '${trimmed}' was not declared in this scope`,
        line: lineNum,
        column: 1,
      });
    }
    
    // Check for incomplete control structures (standalone keywords)
    if (trimmed.match(/^(do|if|while|for|switch|else)$/)) {
      errors.push({
        message: `SyntaxError: incomplete ${trimmed} statement - expected condition or body`,
        line: lineNum,
        column: 1,
      });
    }
    
    // Check for keywords followed by invalid syntax
    if (trimmed.match(/^(do|if|while|for|switch)\s*$/) && !trimmed.includes('(') && !trimmed.includes('{')) {
      errors.push({
        message: `SyntaxError: ${trimmed.split(/\s/)[0]} statement requires condition or body`,
        line: lineNum,
        column: 1,
      });
    }
    
    // Check for malformed function calls or syntax
    if (trimmed.includes('(') && !trimmed.includes(')') && !trimmed.endsWith('{')) {
      errors.push({
        message: 'SyntaxError: expected ")" before end of line',
        line: lineNum,
        column: trimmed.indexOf('(') + 1,
      });
    }

    // Check for missing semicolons on statements
    // Skip lines that are: empty, comments, preprocessor directives, don't end with special chars,
    // control structures, or contain stream operators
    if (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("/*") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("#") &&
      !line.includes("//") && // Skip any line containing a comment
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") &&
      !trimmed.match(
        /^(if|else|for|while|do|switch|case|default|public|private|protected|class|struct|namespace|template|using|enum)\b/
      ) &&
      !trimmed.includes("<<") &&
      trimmed.length > 0
    ) {
      // Check if it looks like a statement that needs semicolon
      if (
        trimmed.match(/=/) ||
        trimmed.match(/^(int|float|double|char|bool|string|void|auto)\s/) ||
        trimmed.match(/^return\s/) ||
        trimmed.includes("++") ||
        trimmed.includes("--")
      ) {
        errors.push({
          message: 'SyntaxError: expected ";" at end of statement',
          line: lineNum,
          column: trimmed.length,
        });
      }
    }

    // Check for unterminated strings
    const doubleQuotes = (line.match(/"/g) || []).length;
    const singleQuotes = (line.match(/'/g) || []).length;

    if (doubleQuotes % 2 !== 0) {
      errors.push({
        message: "SyntaxError: unterminated string literal",
        line: lineNum,
        column: line.indexOf('"') + 1,
      });
    }

    if (singleQuotes % 2 !== 0 && !trimmed.includes("'\\")) {
      errors.push({
        message: "SyntaxError: unterminated character literal",
        line: lineNum,
        column: line.indexOf("'") + 1,
      });
    }
  });

  // Check overall brace balance
  if (braceBalance !== 0) {
    errors.push({
      message: `SyntaxError: mismatched braces in program (balance: ${braceBalance})`,
      line: 1,
      column: 1,
    });
  }
  
  // Check parentheses balance
  if (parenBalance !== 0) {
    errors.push({
      message: `SyntaxError: mismatched parentheses in program (balance: ${parenBalance})`,
      line: 1,
      column: 1,
    });
  }

  return errors;
};

