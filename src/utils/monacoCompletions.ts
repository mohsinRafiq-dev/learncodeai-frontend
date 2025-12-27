/**
 * Monaco Editor Auto-Completion Providers
 * Language-specific keyword suggestions, built-in functions, and code snippets
 */

import type { Monaco } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";

// ============================================
// PYTHON COMPLETIONS
// ============================================
const pythonKeywords = [
  "False", "None", "True", "and", "as", "assert", "async", "await",
  "break", "class", "continue", "def", "del", "elif", "else", "except",
  "finally", "for", "from", "global", "if", "import", "in", "is",
  "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try",
  "while", "with", "yield"
];

const pythonBuiltins = [
  { name: "print", detail: "print(value, ...)", doc: "Print objects to the text stream" },
  { name: "input", detail: "input(prompt)", doc: "Read a string from standard input" },
  { name: "len", detail: "len(obj)", doc: "Return the number of items in a container" },
  { name: "range", detail: "range(start, stop, step)", doc: "Return a sequence of numbers" },
  { name: "str", detail: "str(obj)", doc: "Return a string version of object" },
  { name: "int", detail: "int(x)", doc: "Convert a number or string to an integer" },
  { name: "float", detail: "float(x)", doc: "Convert a string or number to a floating point number" },
  { name: "list", detail: "list(iterable)", doc: "Create a new list" },
  { name: "dict", detail: "dict(**kwargs)", doc: "Create a new dictionary" },
  { name: "set", detail: "set(iterable)", doc: "Create a new set" },
  { name: "tuple", detail: "tuple(iterable)", doc: "Create a new tuple" },
  { name: "bool", detail: "bool(x)", doc: "Return a Boolean value" },
  { name: "type", detail: "type(obj)", doc: "Return the type of an object" },
  { name: "abs", detail: "abs(x)", doc: "Return the absolute value of a number" },
  { name: "max", detail: "max(iterable)", doc: "Return the largest item" },
  { name: "min", detail: "min(iterable)", doc: "Return the smallest item" },
  { name: "sum", detail: "sum(iterable)", doc: "Sum of items in an iterable" },
  { name: "sorted", detail: "sorted(iterable)", doc: "Return a new sorted list" },
  { name: "reversed", detail: "reversed(seq)", doc: "Return a reverse iterator" },
  { name: "enumerate", detail: "enumerate(iterable)", doc: "Return an enumerate object" },
  { name: "zip", detail: "zip(*iterables)", doc: "Iterate over several iterables in parallel" },
  { name: "map", detail: "map(func, iterable)", doc: "Apply function to every item" },
  { name: "filter", detail: "filter(func, iterable)", doc: "Filter items based on function" },
  { name: "open", detail: "open(file, mode)", doc: "Open a file and return a file object" },
  { name: "isinstance", detail: "isinstance(obj, class)", doc: "Check if object is an instance of a class" },
  { name: "hasattr", detail: "hasattr(obj, name)", doc: "Check if object has an attribute" },
  { name: "getattr", detail: "getattr(obj, name)", doc: "Get an attribute from an object" },
  { name: "setattr", detail: "setattr(obj, name, value)", doc: "Set an attribute on an object" },
];

const pythonSnippets = [
  {
    label: "def",
    insertText: "def ${1:function_name}(${2:params}):\n\t${3:pass}",
    detail: "Define a function",
    doc: "Create a new function definition"
  },
  {
    label: "class",
    insertText: "class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}",
    detail: "Define a class",
    doc: "Create a new class with constructor"
  },
  {
    label: "if",
    insertText: "if ${1:condition}:\n\t${2:pass}",
    detail: "If statement",
    doc: "Conditional if statement"
  },
  {
    label: "ifelse",
    insertText: "if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}",
    detail: "If-else statement",
    doc: "Conditional if-else statement"
  },
  {
    label: "for",
    insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
    detail: "For loop",
    doc: "Iterate over a sequence"
  },
  {
    label: "forrange",
    insertText: "for ${1:i} in range(${2:n}):\n\t${3:pass}",
    detail: "For loop with range",
    doc: "Iterate over a range of numbers"
  },
  {
    label: "while",
    insertText: "while ${1:condition}:\n\t${2:pass}",
    detail: "While loop",
    doc: "Loop while condition is true"
  },
  {
    label: "try",
    insertText: "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}",
    detail: "Try-except block",
    doc: "Handle exceptions"
  },
  {
    label: "with",
    insertText: "with ${1:expression} as ${2:var}:\n\t${3:pass}",
    detail: "With statement",
    doc: "Context manager"
  },
  {
    label: "lambda",
    insertText: "lambda ${1:x}: ${2:x}",
    detail: "Lambda function",
    doc: "Create an anonymous function"
  },
  {
    label: "list_comp",
    insertText: "[${1:expr} for ${2:item} in ${3:iterable}]",
    detail: "List comprehension",
    doc: "Create a list using comprehension"
  },
  {
    label: "dict_comp",
    insertText: "{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}",
    detail: "Dictionary comprehension",
    doc: "Create a dictionary using comprehension"
  },
  {
    label: "main",
    insertText: 'if __name__ == "__main__":\n\t${1:main()}',
    detail: "Main guard",
    doc: "Main execution guard"
  },
];

// ============================================
// JAVASCRIPT COMPLETIONS
// ============================================
const javascriptKeywords = [
  "async", "await", "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "export", "extends", "false",
  "finally", "for", "function", "if", "import", "in", "instanceof", "let",
  "new", "null", "of", "return", "static", "super", "switch", "this", "throw",
  "true", "try", "typeof", "undefined", "var", "void", "while", "with", "yield"
];

const javascriptBuiltins = [
  { name: "console.log", detail: "console.log(message)", doc: "Log a message to the console" },
  { name: "console.error", detail: "console.error(message)", doc: "Log an error message" },
  { name: "console.warn", detail: "console.warn(message)", doc: "Log a warning message" },
  { name: "console.table", detail: "console.table(data)", doc: "Display data as a table" },
  { name: "parseInt", detail: "parseInt(string, radix)", doc: "Parse a string and return an integer" },
  { name: "parseFloat", detail: "parseFloat(string)", doc: "Parse a string and return a float" },
  { name: "isNaN", detail: "isNaN(value)", doc: "Determine whether a value is NaN" },
  { name: "isFinite", detail: "isFinite(value)", doc: "Determine whether a value is finite" },
  { name: "JSON.parse", detail: "JSON.parse(text)", doc: "Parse a JSON string" },
  { name: "JSON.stringify", detail: "JSON.stringify(value)", doc: "Convert value to JSON string" },
  { name: "Array.isArray", detail: "Array.isArray(value)", doc: "Determine if value is an array" },
  { name: "Object.keys", detail: "Object.keys(obj)", doc: "Return an array of object's keys" },
  { name: "Object.values", detail: "Object.values(obj)", doc: "Return an array of object's values" },
  { name: "Object.entries", detail: "Object.entries(obj)", doc: "Return an array of [key, value] pairs" },
  { name: "Math.random", detail: "Math.random()", doc: "Return a random number between 0 and 1" },
  { name: "Math.floor", detail: "Math.floor(x)", doc: "Round down to nearest integer" },
  { name: "Math.ceil", detail: "Math.ceil(x)", doc: "Round up to nearest integer" },
  { name: "Math.round", detail: "Math.round(x)", doc: "Round to nearest integer" },
  { name: "Math.max", detail: "Math.max(...values)", doc: "Return the largest value" },
  { name: "Math.min", detail: "Math.min(...values)", doc: "Return the smallest value" },
  { name: "Math.abs", detail: "Math.abs(x)", doc: "Return the absolute value" },
  { name: "Math.sqrt", detail: "Math.sqrt(x)", doc: "Return the square root" },
  { name: "Math.pow", detail: "Math.pow(base, exp)", doc: "Return base to the power of exp" },
  { name: "setTimeout", detail: "setTimeout(fn, delay)", doc: "Execute function after delay" },
  { name: "setInterval", detail: "setInterval(fn, delay)", doc: "Execute function repeatedly" },
  { name: "clearTimeout", detail: "clearTimeout(id)", doc: "Cancel a timeout" },
  { name: "clearInterval", detail: "clearInterval(id)", doc: "Cancel an interval" },
  { name: "prompt", detail: "prompt(message)", doc: "Display a dialog with input field" },
  { name: "alert", detail: "alert(message)", doc: "Display an alert dialog" },
];

const javascriptSnippets = [
  {
    label: "func",
    insertText: "function ${1:name}(${2:params}) {\n\t${3}\n}",
    detail: "Function declaration",
    doc: "Create a named function"
  },
  {
    label: "arrow",
    insertText: "const ${1:name} = (${2:params}) => {\n\t${3}\n};",
    detail: "Arrow function",
    doc: "Create an arrow function"
  },
  {
    label: "arrowShort",
    insertText: "const ${1:name} = (${2:params}) => ${3:expression};",
    detail: "Short arrow function",
    doc: "Create a single-expression arrow function"
  },
  {
    label: "class",
    insertText: "class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n}",
    detail: "Class declaration",
    doc: "Create a class with constructor"
  },
  {
    label: "if",
    insertText: "if (${1:condition}) {\n\t${2}\n}",
    detail: "If statement",
    doc: "Conditional if statement"
  },
  {
    label: "ifelse",
    insertText: "if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}",
    detail: "If-else statement",
    doc: "Conditional if-else statement"
  },
  {
    label: "ternary",
    insertText: "${1:condition} ? ${2:true} : ${3:false}",
    detail: "Ternary operator",
    doc: "Conditional ternary expression"
  },
  {
    label: "for",
    insertText: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}",
    detail: "For loop",
    doc: "Classic for loop with index"
  },
  {
    label: "forof",
    insertText: "for (const ${1:item} of ${2:iterable}) {\n\t${3}\n}",
    detail: "For...of loop",
    doc: "Iterate over iterable values"
  },
  {
    label: "forin",
    insertText: "for (const ${1:key} in ${2:object}) {\n\t${3}\n}",
    detail: "For...in loop",
    doc: "Iterate over object keys"
  },
  {
    label: "foreach",
    insertText: "${1:array}.forEach((${2:item}) => {\n\t${3}\n});",
    detail: "forEach loop",
    doc: "Array forEach method"
  },
  {
    label: "map",
    insertText: "${1:array}.map((${2:item}) => {\n\t${3}\n});",
    detail: "Array map",
    doc: "Transform array elements"
  },
  {
    label: "filter",
    insertText: "${1:array}.filter((${2:item}) => ${3:condition});",
    detail: "Array filter",
    doc: "Filter array elements"
  },
  {
    label: "reduce",
    insertText: "${1:array}.reduce((${2:acc}, ${3:item}) => {\n\t${4}\n}, ${5:initialValue});",
    detail: "Array reduce",
    doc: "Reduce array to single value"
  },
  {
    label: "while",
    insertText: "while (${1:condition}) {\n\t${2}\n}",
    detail: "While loop",
    doc: "Loop while condition is true"
  },
  {
    label: "try",
    insertText: "try {\n\t${1}\n} catch (${2:error}) {\n\t${3}\n}",
    detail: "Try-catch block",
    doc: "Handle exceptions"
  },
  {
    label: "trycatchfinally",
    insertText: "try {\n\t${1}\n} catch (${2:error}) {\n\t${3}\n} finally {\n\t${4}\n}",
    detail: "Try-catch-finally",
    doc: "Handle exceptions with cleanup"
  },
  {
    label: "switch",
    insertText: "switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}",
    detail: "Switch statement",
    doc: "Multi-way branch statement"
  },
  {
    label: "async",
    insertText: "async function ${1:name}(${2:params}) {\n\t${3}\n}",
    detail: "Async function",
    doc: "Create an async function"
  },
  {
    label: "asyncArrow",
    insertText: "const ${1:name} = async (${2:params}) => {\n\t${3}\n};",
    detail: "Async arrow function",
    doc: "Create an async arrow function"
  },
  {
    label: "promise",
    insertText: "new Promise((resolve, reject) => {\n\t${1}\n});",
    detail: "Promise",
    doc: "Create a new Promise"
  },
  {
    label: "fetch",
    insertText: "fetch('${1:url}')\n\t.then(response => response.json())\n\t.then(data => {\n\t\t${2}\n\t})\n\t.catch(error => console.error(error));",
    detail: "Fetch API",
    doc: "Make an HTTP request"
  },
  {
    label: "cl",
    insertText: "console.log(${1});",
    detail: "console.log",
    doc: "Log to console"
  },
];

// ============================================
// C++ COMPLETIONS
// ============================================
const cppKeywords = [
  "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand", "bitor",
  "bool", "break", "case", "catch", "char", "char16_t", "char32_t", "class",
  "compl", "const", "constexpr", "const_cast", "continue", "decltype", "default",
  "delete", "do", "double", "dynamic_cast", "else", "enum", "explicit", "export",
  "extern", "false", "float", "for", "friend", "goto", "if", "inline", "int",
  "long", "mutable", "namespace", "new", "noexcept", "not", "not_eq", "nullptr",
  "operator", "or", "or_eq", "private", "protected", "public", "register",
  "reinterpret_cast", "return", "short", "signed", "sizeof", "static",
  "static_assert", "static_cast", "struct", "switch", "template", "this",
  "thread_local", "throw", "true", "try", "typedef", "typeid", "typename",
  "union", "unsigned", "using", "virtual", "void", "volatile", "wchar_t",
  "while", "xor", "xor_eq"
];

const cppBuiltins = [
  { name: "cout", detail: "std::cout << value", doc: "Output stream for console" },
  { name: "cin", detail: "std::cin >> variable", doc: "Input stream from console" },
  { name: "endl", detail: "std::endl", doc: "End line and flush stream" },
  { name: "string", detail: "std::string", doc: "String class" },
  { name: "vector", detail: "std::vector<T>", doc: "Dynamic array container" },
  { name: "map", detail: "std::map<K, V>", doc: "Key-value container (sorted)" },
  { name: "unordered_map", detail: "std::unordered_map<K, V>", doc: "Hash map container" },
  { name: "set", detail: "std::set<T>", doc: "Unique sorted elements" },
  { name: "queue", detail: "std::queue<T>", doc: "FIFO container" },
  { name: "stack", detail: "std::stack<T>", doc: "LIFO container" },
  { name: "pair", detail: "std::pair<T1, T2>", doc: "Pair of two values" },
  { name: "make_pair", detail: "std::make_pair(a, b)", doc: "Create a pair" },
  { name: "sort", detail: "std::sort(begin, end)", doc: "Sort elements in range" },
  { name: "reverse", detail: "std::reverse(begin, end)", doc: "Reverse elements in range" },
  { name: "find", detail: "std::find(begin, end, value)", doc: "Find element in range" },
  { name: "count", detail: "std::count(begin, end, value)", doc: "Count occurrences" },
  { name: "max", detail: "std::max(a, b)", doc: "Return the larger value" },
  { name: "min", detail: "std::min(a, b)", doc: "Return the smaller value" },
  { name: "swap", detail: "std::swap(a, b)", doc: "Swap two values" },
  { name: "abs", detail: "std::abs(x)", doc: "Absolute value" },
  { name: "sqrt", detail: "std::sqrt(x)", doc: "Square root" },
  { name: "pow", detail: "std::pow(base, exp)", doc: "Power function" },
  { name: "to_string", detail: "std::to_string(value)", doc: "Convert number to string" },
  { name: "stoi", detail: "std::stoi(str)", doc: "String to integer" },
  { name: "stod", detail: "std::stod(str)", doc: "String to double" },
  { name: "getline", detail: "std::getline(cin, str)", doc: "Read entire line" },
  { name: "push_back", detail: ".push_back(value)", doc: "Add element to end" },
  { name: "pop_back", detail: ".pop_back()", doc: "Remove last element" },
  { name: "size", detail: ".size()", doc: "Get container size" },
  { name: "empty", detail: ".empty()", doc: "Check if container is empty" },
  { name: "begin", detail: ".begin()", doc: "Iterator to first element" },
  { name: "end", detail: ".end()", doc: "Iterator past last element" },
];

const cppSnippets = [
  {
    label: "main",
    insertText: "#include <iostream>\nusing namespace std;\n\nint main() {\n\t${1}\n\treturn 0;\n}",
    detail: "Main function",
    doc: "Basic C++ program structure"
  },
  {
    label: "include",
    insertText: "#include <${1:iostream}>",
    detail: "Include header",
    doc: "Include a header file"
  },
  {
    label: "includestr",
    insertText: '#include "${1:header.h}"',
    detail: "Include local header",
    doc: "Include a local header file"
  },
  {
    label: "func",
    insertText: "${1:void} ${2:functionName}(${3:params}) {\n\t${4}\n}",
    detail: "Function definition",
    doc: "Create a function"
  },
  {
    label: "class",
    insertText: "class ${1:ClassName} {\npublic:\n\t${1:ClassName}() {\n\t\t${2}\n\t}\n\nprivate:\n\t${3}\n};",
    detail: "Class definition",
    doc: "Create a class with constructor"
  },
  {
    label: "struct",
    insertText: "struct ${1:StructName} {\n\t${2}\n};",
    detail: "Struct definition",
    doc: "Create a struct"
  },
  {
    label: "if",
    insertText: "if (${1:condition}) {\n\t${2}\n}",
    detail: "If statement",
    doc: "Conditional if statement"
  },
  {
    label: "ifelse",
    insertText: "if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}",
    detail: "If-else statement",
    doc: "Conditional if-else statement"
  },
  {
    label: "for",
    insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}",
    detail: "For loop",
    doc: "Classic for loop"
  },
  {
    label: "forrange",
    insertText: "for (auto& ${1:item} : ${2:container}) {\n\t${3}\n}",
    detail: "Range-based for",
    doc: "Iterate over container"
  },
  {
    label: "while",
    insertText: "while (${1:condition}) {\n\t${2}\n}",
    detail: "While loop",
    doc: "Loop while condition is true"
  },
  {
    label: "dowhile",
    insertText: "do {\n\t${1}\n} while (${2:condition});",
    detail: "Do-while loop",
    doc: "Loop at least once"
  },
  {
    label: "switch",
    insertText: "switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n\t\tbreak;\n}",
    detail: "Switch statement",
    doc: "Multi-way branch"
  },
  {
    label: "try",
    insertText: "try {\n\t${1}\n} catch (const ${2:exception}& e) {\n\t${3}\n}",
    detail: "Try-catch block",
    doc: "Handle exceptions"
  },
  {
    label: "vector",
    insertText: "vector<${1:int}> ${2:vec};",
    detail: "Vector declaration",
    doc: "Create a vector"
  },
  {
    label: "vectorinit",
    insertText: "vector<${1:int}> ${2:vec} = {${3}};",
    detail: "Vector with init",
    doc: "Create and initialize a vector"
  },
  {
    label: "map",
    insertText: "map<${1:string}, ${2:int}> ${3:mp};",
    detail: "Map declaration",
    doc: "Create a map"
  },
  {
    label: "cout",
    insertText: 'cout << ${1:"Hello"} << endl;',
    detail: "Console output",
    doc: "Print to console"
  },
  {
    label: "cin",
    insertText: "cin >> ${1:variable};",
    detail: "Console input",
    doc: "Read from console"
  },
  {
    label: "template",
    insertText: "template <typename ${1:T}>\n${2:T} ${3:functionName}(${4:params}) {\n\t${5}\n}",
    detail: "Template function",
    doc: "Create a template function"
  },
];

// ============================================
// COMPLETION PROVIDER REGISTRATION
// ============================================

export const registerPythonCompletions = (monaco: Monaco): monacoType.IDisposable => {
  return monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monacoType.languages.CompletionItem[] = [];

      // Add keywords
      pythonKeywords.forEach((keyword) => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
          detail: "Keyword",
        });
      });

      // Add built-in functions
      pythonBuiltins.forEach((builtin) => {
        suggestions.push({
          label: builtin.name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: builtin.name,
          range,
          detail: builtin.detail,
          documentation: builtin.doc,
        });
      });

      // Add snippets
      pythonSnippets.forEach((snippet) => {
        suggestions.push({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: snippet.detail,
          documentation: snippet.doc,
        });
      });

      return { suggestions };
    },
  });
};

export const registerJavaScriptCompletions = (monaco: Monaco): monacoType.IDisposable => {
  return monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monacoType.languages.CompletionItem[] = [];

      // Add keywords
      javascriptKeywords.forEach((keyword) => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
          detail: "Keyword",
        });
      });

      // Add built-in functions
      javascriptBuiltins.forEach((builtin) => {
        suggestions.push({
          label: builtin.name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: builtin.name,
          range,
          detail: builtin.detail,
          documentation: builtin.doc,
        });
      });

      // Add snippets
      javascriptSnippets.forEach((snippet) => {
        suggestions.push({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: snippet.detail,
          documentation: snippet.doc,
        });
      });

      return { suggestions };
    },
  });
};

export const registerCppCompletions = (monaco: Monaco): monacoType.IDisposable => {
  return monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monacoType.languages.CompletionItem[] = [];

      // Add keywords
      cppKeywords.forEach((keyword) => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
          detail: "Keyword",
        });
      });

      // Add built-in functions/types
      cppBuiltins.forEach((builtin) => {
        suggestions.push({
          label: builtin.name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: builtin.name,
          range,
          detail: builtin.detail,
          documentation: builtin.doc,
        });
      });

      // Add snippets
      cppSnippets.forEach((snippet) => {
        suggestions.push({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: snippet.detail,
          documentation: snippet.doc,
        });
      });

      return { suggestions };
    },
  });
};

// Register all language completions at once
export const registerAllCompletions = (monaco: Monaco): monacoType.IDisposable[] => {
  return [
    registerPythonCompletions(monaco),
    registerJavaScriptCompletions(monaco),
    registerCppCompletions(monaco),
  ];
};
