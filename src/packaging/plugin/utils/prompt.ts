import { createInterface, Interface } from 'readline';

/**
 * Creates a readline interface for prompting user input
 */
function createReadlineInterface(): Interface {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompts the user for input
 * @param question The question to ask
 * @returns The user's input (trimmed) or empty string if skipped
 */
export function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts the user for multiple fields
 * @param fields Array of field prompts: { name: string, question: string }
 * @returns Object with field names as keys and user input as values (empty string if skipped)
 */
export async function promptMultiple(
  fields: Array<{ name: string; question: string }>
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const field of fields) {
    const answer = await prompt(field.question);
    results[field.name] = answer;
  }
  
  return results;
}

