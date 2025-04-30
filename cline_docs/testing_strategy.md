# StatPearls MCP Server Testing Strategy

This document outlines the testing strategy for the StatPearls MCP server to ensure it functions correctly and reliably.

## Testing Approach

We'll use a combination of unit tests, integration tests, and manual testing to verify the functionality of the StatPearls MCP server.

## Unit Tests

Unit tests will focus on testing individual components in isolation, using mocks for external dependencies.

### Search Functionality Tests

- **Test search URL construction**
  - Verify that the search URL is correctly constructed with the query parameter
  - Test handling of special characters in the query

- **Test search results parsing**
  - Test with mock HTML responses
  - Verify correct extraction of titles, URLs, and descriptions
  - Test with empty results
  - Test with malformed HTML

- **Test result scoring and selection**
  - Verify that results are correctly scored based on relevance
  - Test that the most relevant result is selected
  - Test handling of empty results

### Content Retrieval Tests

- **Test article content fetching**
  - Verify correct handling of successful responses
  - Test error handling for failed requests

- **Test article content parsing**
  - Test with mock HTML responses
  - Verify correct extraction of article title and sections
  - Test handling of various HTML structures
  - Test with malformed HTML

- **Test section filtering**
  - Verify that unwanted sections are correctly filtered out
  - Test with various section structures

### Markdown Conversion Tests

- **Test HTML to Markdown conversion**
  - Verify correct conversion of basic HTML elements
  - Test handling of tables
  - Test handling of lists
  - Test handling of images
  - Test handling of special medical formatting

- **Test Markdown formatting**
  - Verify correct formatting of the final Markdown document
  - Test with various formatting options
  - Test length limiting

### Error Handling Tests

- **Test network error handling**
  - Verify correct handling of connection errors
  - Test timeout handling

- **Test parsing error handling**
  - Verify correct handling of malformed HTML
  - Test with unexpected HTML structures

- **Test input validation**
  - Verify correct handling of invalid input parameters
  - Test with missing required parameters
  - Test with invalid parameter types

## Integration Tests

Integration tests will verify that the components work together correctly.

### End-to-End Flow Tests

- **Test complete search-to-response flow**
  - Verify that a query flows correctly through all components
  - Test with mock external services

- **Test error propagation**
  - Verify that errors are correctly propagated through the system
  - Test error handling at each stage

### MCP Server Integration Tests

- **Test tool registration**
  - Verify that the tool is correctly registered with the MCP server

- **Test tool invocation**
  - Verify that the tool can be invoked through the MCP server
  - Test with valid parameters
  - Test with invalid parameters

## Manual Testing

Manual testing will verify the functionality with real-world queries and responses.

### Real-World Query Tests

- **Test with common diseases**
  - Verify correct information retrieval for common diseases like diabetes, hypertension, etc.

- **Test with rare diseases**
  - Verify handling of rare or specialized medical conditions

- **Test with ambiguous terms**
  - Verify handling of terms that could match multiple conditions

### Performance Testing

- **Test response time**
  - Measure response time for various queries
  - Identify performance bottlenecks

- **Test with concurrent requests**
  - Verify handling of multiple concurrent requests

## Test Data

We'll create a set of test data to use in our tests:

### Mock HTML Responses

- **Search results page**
  - With multiple results
  - With single result
  - With no results

- **Article pages**
  - With various section structures
  - With tables, lists, and other complex elements

### Test Queries

- **Common diseases**
  - "diabetes"
  - "hypertension"
  - "asthma"

- **Rare diseases**
  - "Marfan syndrome"
  - "Huntington's disease"

- **Ambiguous terms**
  - "fever"
  - "pain"

## Test Implementation

We'll implement tests using a testing framework like Jest or Mocha.

### Example Test Structure

```typescript
// Example unit test for search functionality
describe("Search Functionality", () => {
  describe("searchStatPearls", () => {
    it("should construct the correct search URL", () => {
      // Test implementation
    });

    it("should handle network errors", () => {
      // Test implementation
    });

    it("should parse search results correctly", () => {
      // Test implementation
    });
  });

  describe("scoreResults", () => {
    it("should score results based on relevance", () => {
      // Test implementation
    });

    it("should handle empty results", () => {
      // Test implementation
    });
  });
});

// Example integration test
describe("End-to-End Flow", () => {
  it("should process a query and return formatted information", async () => {
    // Test implementation
  });

  it("should handle errors in the processing pipeline", async () => {
    // Test implementation
  });
});
```

## Test Mocks

We'll create mocks for external dependencies to isolate our tests:

### Fetch Mock

```typescript
// Mock for fetch to avoid actual network requests
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes("search")) {
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(mockSearchResultsHtml),
    });
  } else if (url.includes("article")) {
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(mockArticleHtml),
    });
  } else {
    return Promise.reject(new Error("Not found"));
  }
});
```

### HTML Parser Mock

```typescript
// Mock for HTML parser to avoid DOM dependencies
jest.mock("../src/utils/html", () => ({
  extractSearchResults: jest.fn().mockReturnValue([
    { title: "Diabetes", url: "https://example.com/diabetes", description: "Information about diabetes" },
    { title: "Type 2 Diabetes", url: "https://example.com/type2", description: "Information about type 2 diabetes" },
  ]),
  extractArticleContent: jest.fn().mockReturnValue({
    title: "Diabetes",
    sections: [
      { heading: "Introduction", content: "Diabetes is a metabolic disorder..." },
      { heading: "Etiology", content: "The causes of diabetes include..." },
    ],
  }),
}));
```

## Continuous Integration

We'll set up continuous integration to run tests automatically on code changes:

1. Run unit tests on every commit
2. Run integration tests on pull requests
3. Generate test coverage reports

## Test Coverage Goals

We aim for high test coverage to ensure reliability:

- **Unit tests**: 90%+ coverage of all functions
- **Integration tests**: Coverage of all main flows
- **Edge cases**: Tests for all identified edge cases

## Conclusion

This testing strategy provides a comprehensive approach to ensuring the reliability and correctness of the StatPearls MCP server. By combining unit tests, integration tests, and manual testing, we can have confidence in the functionality of the server.