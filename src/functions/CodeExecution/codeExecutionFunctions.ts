// Code execution functions
import { codeAPI } from '../../services/api';

// Types
interface CodeExecutionResult {
  success: boolean;
  data?: {
    output?: string;
  };
  error?: string;
}

interface LanguageOption {
  id: string;
  name: string;
  defaultCode: string;
}

// Language configurations
export const languageOptions: LanguageOption[] = [
  {
    id: "javascript",
    name: "JavaScript",
    defaultCode: `// Recursive function example
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// While loop example
let count = 1;
while (count <= 5) {
    console.log("Count:", count);
    count++;
}

// Object example
let person = { name: "Alice", age: 30 };
console.log("Name:", person.name, "Age:", person.age);`,
  },
  {
    id: "python",
    name: "Python",
    defaultCode: `# Recursive function example
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))

# While loop example
count = 1
while count <= 5:
    print("Count:", count)
    count += 1

# Dictionary example
person = {"name": "Alice", "age": 30}
print("Name:", person["name"], "Age:", person["age"])`,
  },
  {
    id: "cpp",
    name: "C++",
    defaultCode: `#include <iostream>
#include <map>
#include <string>
using namespace std;

// Recursive function example
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Factorial of 5: " << factorial(5) << endl;

    // Do-while loop example
    int count = 1;
    do {
        cout << "Count: " << count << endl;
        count++;
    } while (count <= 5);

    // Map example
    map<string, int> person;
    person["age"] = 30;
    cout << "Age: " << person["age"] << endl;

    return 0;
}`,
  },
];

// Code execution handler
export const handleCodeExecution = async (
  code: string,
  language: string,
  input: string,
  setOutput: (output: string) => void,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);
  setOutput("Running...");

  try {
    // Validate inputs
    if (!code.trim()) {
      setOutput("Error: No code to execute");
      setLoading(false);
      return;
    }

    if (!language) {
      setOutput("Error: No language selected");
      setLoading(false);
      return;
    }

    const result: CodeExecutionResult = await codeAPI.executeCode(code, language, input);
    
    if (result.success) {
      setOutput(result.data?.output || "No output");
    } else {
      setOutput(result.error || "Execution failed");
    }
  } catch (error: unknown) {
    const executionError = error as { response?: { data?: { message?: string } } };
    setOutput(
      executionError?.response?.data?.message || 
      "Error: Failed to execute code. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

// Language change handler
export const handleLanguageChange = (
  newLanguage: string,
  setLanguage: (language: string) => void,
  setCode: (code: string) => void
) => {
  setLanguage(newLanguage);
  
  // Set default code for the selected language
  const selectedLanguage = languageOptions.find(lang => lang.id === newLanguage);
  if (selectedLanguage) {
    setCode(selectedLanguage.defaultCode);
  }
};

// Get language display name
export const getLanguageDisplayName = (languageId: string): string => {
  const language = languageOptions.find(lang => lang.id === languageId);
  return language?.name || languageId;
};

// Get default code for language
export const getDefaultCodeForLanguage = (languageId: string): string => {
  const language = languageOptions.find(lang => lang.id === languageId);
  return language?.defaultCode || "// write your code here...";
};

// Validate code input
export const validateCode = (code: string, language: string): string | null => {
  if (!code.trim()) {
    return "Code cannot be empty";
  }

  if (!language) {
    return "Please select a programming language";
  }

  // Language-specific basic validation
  switch (language) {
    case 'javascript':
      // Basic JavaScript validation (can be expanded)
      break;
    case 'python':
      // Basic Python validation (can be expanded)
      break;
    case 'cpp':
      // Basic C++ validation (can be expanded)
      if (!code.includes('#include')) {
        return "Warning: C++ code should include necessary headers";
      }
      if (!code.includes('main')) {
        return "Warning: C++ code should have a main function";
      }
      break;
    default:
      return "Unsupported programming language";
  }

  return null;
};

// Format code output
export const formatCodeOutput = (output: string): string => {
  if (!output) return "No output";
  
  // Remove excessive newlines
  return output.replace(/\n{3,}/g, '\n\n').trim();
};

// Check if language is supported
export const isLanguageSupported = (languageId: string): boolean => {
  return languageOptions.some(lang => lang.id === languageId);
};
