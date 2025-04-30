/**
 * Error handling utilities for the StatPearls MCP server
 */

/**
 * Custom error class for search-related errors
 */
export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchError";
  }
}

/**
 * Custom error class for content retrieval errors
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

/**
 * Custom error class for parsing errors
 */
export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}

/**
 * Wraps a function with error handling
 * @param fn The function to wrap
 * @param errorMessage The error message to use if the function throws
 * @returns The wrapped function
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorMessage: string
): (...args: Args) => Promise<T> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}

/**
 * Wraps a synchronous function with error handling
 * @param fn The function to wrap
 * @param errorMessage The error message to use if the function throws
 * @returns The wrapped function
 */
export function withSyncErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => T,
  errorMessage: string
): (...args: Args) => T {
  return (...args: Args) => {
    try {
      return fn(...args);
    } catch (error) {
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}

/**
 * Logs an error to the console
 * @param error The error to log
 * @param context Additional context information
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextPrefix = context ? `[${context}] ` : '';
  console.error(`${contextPrefix}Error: ${errorMessage}`);
  
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}