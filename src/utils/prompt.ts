import { createInterface, Interface } from 'readline';
import { logger } from '@src/logger';

/**
 * Creates a readline interface for prompting user input
 */
function createReadlineInterface(): Interface {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt<T = string>(
  question: string,
  transform: (input: string) => T,
  defaultValue?: T
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();

    rl.question(question, (answer) => {
      rl.close();
      resolve(transform(answer.trim()) || defaultValue);
    });
  });
}

async function promptString(
  question: string,
  defaultValue?: string,
  allowedValues?: string[]
): Promise<string | undefined> {
  if (allowedValues && allowedValues.length > 0) {
    // Retry until valid value or default is used
    while (true) {
      const rl = createReadlineInterface();
      const answer = await new Promise<string>((resolve) => {
        rl.question(question, (input) => {
          rl.close();
          resolve(input.trim());
        });
      });

      // If empty and default exists, use default
      if (!answer && defaultValue !== undefined) {
        return defaultValue;
      }

      // If empty and no default, return undefined (will be handled by caller)
      if (!answer) {
        return undefined;
      }

      // Check if answer is in allowed values (case-insensitive match, but return original case)
      const normalizedAnswer = answer.toLowerCase();
      const matchedValue = allowedValues.find(
        (val) => val.toLowerCase() === normalizedAnswer
      );

      if (matchedValue) {
        return matchedValue;
      }

      // Invalid value, show error and retry
      logger.warn(
        `Invalid value. Allowed values are: ${allowedValues.join(', ')}. Please try again.`
      );
    }
  }

  return prompt(question, (input) => input.trim(), defaultValue);
}

async function promptNumber(
  question: string,
  defaultValue?: number
): Promise<number | undefined> {
  return prompt(question, (input) => {
    const parsed = parseFloat(input.trim());
    return isNaN(parsed) ? NaN : parsed;
  }, defaultValue);
}

async function promptBoolean(
  question: string,
  defaultValue?: boolean
): Promise<boolean | undefined> {
  return prompt(question, (input) => {
    const lower = input.toLowerCase().trim();
    return lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1';
  }, defaultValue);
}

async function promptInteger(
  question: string,
  defaultValue?: number
): Promise<number | undefined> {
  return prompt(question, (input) => {
    const parsed = parseInt(input.trim(), 10);
    return isNaN(parsed) ? NaN : parsed;
  }, defaultValue);
}

export const promptFns: Record<string, (question: string, defaultValue?: any, allowedValues?: string[]) => Promise<any>> = {
  string: promptString,
  number: promptNumber,
  boolean: promptBoolean,
  integer: promptInteger,
}

/**
 * Field definition for multiple prompts with type support
 */
export type PromptField<T = string> = {
  name: string;
  question: string;
  type?: 'string' | 'number' | 'integer' | 'boolean';
  defaultValue?: T;
  ignore?: boolean;
  allowedValues?: string[];
};

/**
 * Prompts the user for multiple fields with type support
 * @param fields Array of field prompts with optional type information
 * @returns Object with field names as keys and typed user input as values
 */
export async function promptMultiple(
  fields: Array<PromptField<any>>
): Promise<Record<string, any>> {
  const results: any = {};

  for (const field of fields) {
    let answer: any;

    if (field.ignore) continue;

    if (field.type === 'number') answer = await promptFns.number(field.question, field.defaultValue);
    else if (field.type === 'integer') answer = await promptFns.integer(field.question, field.defaultValue);
    else if (field.type === 'boolean') answer = await promptFns.boolean(field.question, field.defaultValue);
    else answer = await promptFns.string(field.question, field.defaultValue, field.allowedValues);

    results[field.name] = answer;
  }

  return results;
}
