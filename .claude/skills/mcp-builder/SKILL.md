---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
license: Complete terms in LICENSE.txt
---

# MCP Server Development Guide

## Overview

Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.

---

# Process

## 🚀 High-Level Workflow

Creating a high-quality MCP server involves four main phases:

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design

**API Coverage vs. Workflow Tools:**
Balance comprehensive API endpoint coverage with specialized workflow tools. Workflow tools can be more convenient for specific tasks, while comprehensive coverage gives agents flexibility to compose operations. Performance varies by client—some clients benefit from code execution that combines basic tools, while others work better with higher-level workflows. When uncertain, prioritize comprehensive API coverage.

**Tool Naming and Discoverability:**
Clear, descriptive tool names help agents find the right tools quickly. Use consistent prefixes (e.g., `github_create_issue`, `github_list_repos`) and action-oriented naming.

**Context Management:**
Agents benefit from concise tool descriptions and the ability to filter/paginate results. Design tools that return focused, relevant data. Some clients support code execution which can help agents filter and process data efficiently.

**Actionable Error Messages:**
Error messages should guide agents toward solutions with specific suggestions and next steps.

#### 1.2 Study MCP Protocol Documentation

**Navigate the MCP specification:**

Start with the sitemap to find relevant pages: `https://modelcontextprotocol.io/sitemap.xml`

Then fetch specific pages with `.md` suffix for markdown format (e.g., `https://modelcontextprotocol.io/specification/draft.md`).

Key pages to review:
- Specification overview and architecture
- Transport mechanisms (streamable HTTP, stdio)
- Tool, resource, and prompt definitions

#### 1.3 Study Framework Documentation

**Recommended stack:**
- **Language**: TypeScript (high-quality SDK support and good compatibility in many execution environments e.g. MCPB. Plus AI models are good at generating TypeScript code, benefiting from its broad usage, static typing and good linting tools)
- **Transport**: Streamable HTTP for remote servers, using stateless JSON (simpler to scale and maintain, as opposed to stateful sessions and streaming responses). stdio for local servers.

**Load framework documentation:**

- **MCP Best Practices**: [📋 View Best Practices](./reference/mcp_best_practices.md) - Core guidelines

**For TypeScript (recommended):**
- **TypeScript SDK**: Use WebFetch to load `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript Guide](./reference/node_mcp_server.md) - TypeScript patterns and examples

**For Python:**
- **Python SDK**: Use WebFetch to load `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python Guide](./reference/python_mcp_server.md) - Python patterns and examples

#### 1.4 Plan Your Implementation

**Understand the API:**
Review the service's API documentation to identify key endpoints, authentication requirements, and data models. Use web search and WebFetch as needed.

**Tool Selection:**
Prioritize comprehensive API coverage. List endpoints to implement, starting with the most common operations.

---

## Minimal Working TypeScript Server (init → tool → run)

Before diving into the full architecture, here is a complete, runnable stdio MCP server in TypeScript. This is the smallest thing that works end-to-end — copy it, run it, then grow it.

**SDK version:** `@modelcontextprotocol/sdk` (current line **1.x**, e.g. 1.29.x as of May 2026). It has a peer dependency on **Zod** (v3.25+ or v4). Confirm the latest on npm before pinning: https://www.npmjs.com/package/@modelcontextprotocol/sdk

`package.json`:
```json
{
  "name": "weather-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": { "weather-mcp": "dist/index.js" },
  "scripts": { "build": "tsc", "start": "node dist/index.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "zod": "^3.25.0"
  },
  "devDependencies": { "typescript": "^5.6.0", "@types/node": "^22.0.0" }
}
```

`tsconfig.json` (essentials):
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "Node16", "moduleResolution": "Node16",
    "outDir": "dist", "strict": true, "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

`src/index.ts`:
```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. INIT — create the server
const server = new McpServer({ name: "weather-mcp", version: "1.0.0" });

// 2. TOOL — register a tool with a Zod input schema and annotations
server.registerTool(
  "get_forecast",
  {
    title: "Get Weather Forecast",
    description: "Return a short weather forecast for a city.",
    inputSchema: { city: z.string().min(1).describe("City name, e.g. 'Austin'") },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ city }) => {
    try {
      // ...real implementation would call a weather API here...
      const forecast = `Sunny, 24°C in ${city}.`;
      return { content: [{ type: "text", text: forecast }] };
    } catch (err) {
      // Surface tool failures with isError so the model can recover/retry.
      return {
        content: [{ type: "text", text: `Error fetching forecast: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  }
);

// 3. RUN — connect over stdio (local). For remote, use StreamableHTTPServerTransport.
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("weather-mcp running on stdio"); // logs MUST go to stderr on stdio
}
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
```

Build and inspect:
```bash
npm install && npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

**Key gotchas in this minimal server:**
- On **stdio**, stdout is the protocol channel — never `console.log`; all logging goes to **stderr** (`console.error`).
- Return tool failures as `{ content: [...], isError: true }` rather than throwing — this lets the model see the error and react.
- The `inputSchema` is a plain object of Zod validators (the SDK wraps it), not a `z.object(...)` in `registerTool`.

For the full architecture (HTTP transport, pagination, output schemas, shared API client, project layout), continue to the [⚡ TypeScript Guide](./reference/node_mcp_server.md) and the [error-handling reference](./reference/error_handling.md).

---

## Common Failure Modes

These are the six failure scenarios most likely to break a production MCP server. Handle each before shipping. Full patterns with code are in [🛡️ Error Handling & Resilience Guide](./reference/error_handling.md).

| # | Failure | Symptom | Fix |
|---|---------|---------|-----|
| 1 | **Rate-limited (429)** | Requests rejected by the upstream API | Retry with exponential backoff + jitter; read and honor the `Retry-After` header before the first retry. |
| 2 | **Auth token expiry mid-session** | All tools start returning 401 after initial success | Refresh exactly once: use a shared promise/lock so concurrent requests collapse into a single refresh rather than stampeding the token endpoint. |
| 3 | **Response too large** | Tool returns thousands of items; client times out or truncates | Paginate: accept `cursor`/`page` params and return a page + next-cursor. Never return 10k+ items in one call. For streaming APIs, chunk the response. |
| 4 | **Partial failure in a multi-step operation** | Step 3 of 5 fails; earlier steps already mutated state | Either make the whole operation atomic (rollback on failure) or return `isError: true` with a clear partial-success report: what succeeded, what failed, how to resume. |
| 5 | **Timeout on slow external API** | Tool call hangs; MCP connection appears frozen | Set a per-request timeout (e.g. `AbortSignal.timeout(10_000)`). On expiry, return `{ content: [...], isError: true }` with a timeout message — never let the tool hang the MCP transport. |
| 6 | **stdio transport: debug output on stdout** | Client receives garbled JSON; protocol breaks silently | On stdio, `stdout` is the protocol channel. All logging **must** go to `stderr` (`console.error` in Node, `sys.stderr` in Python). Never use `console.log` or `print()`. |

---

### Phase 2: Implementation

#### 2.1 Set Up Project Structure

See language-specific guides for project setup:
- [⚡ TypeScript Guide](./reference/node_mcp_server.md) - Project structure, package.json, tsconfig.json
- [🐍 Python Guide](./reference/python_mcp_server.md) - Module organization, dependencies

#### 2.2 Implement Core Infrastructure

Create shared utilities:
- API client with authentication
- Error handling helpers
- Response formatting (JSON/Markdown)
- Pagination support

**Build resilience in from the start** — production MCP servers must handle the failure modes real APIs throw at them. Load the [🛡️ Error Handling & Resilience Guide](./reference/error_handling.md) for complete patterns covering:
- Protocol errors vs. tool errors (`isError` flag)
- Timeouts on every network call
- Retries with exponential backoff + jitter (and which errors to retry)
- Rate limits (HTTP 429 + `Retry-After`)
- Auth and token refresh (401 handling, collapsing concurrent refreshes)

#### 2.3 Implement Tools

For each tool:

**Input Schema:**
- Use Zod (TypeScript) or Pydantic (Python)
- Include constraints and clear descriptions
- Add examples in field descriptions

**Output Schema:**
- Define `outputSchema` where possible for structured data
- Use `structuredContent` in tool responses (TypeScript SDK feature)
- Helps clients understand and process tool outputs

**Tool Description:**
- Concise summary of functionality
- Parameter descriptions
- Return type schema

**Implementation:**
- Async/await for I/O operations
- Proper error handling with actionable messages
- Support pagination where applicable
- Return both text content and structured data when using modern SDKs

**Annotations:**
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### Phase 3: Review and Test

#### 3.1 Code Quality

Review for:
- No duplicated code (DRY principle)
- Consistent error handling
- Full type coverage
- Clear tool descriptions

#### 3.2 Build and Test

**TypeScript:**
- Run `npm run build` to verify compilation
- Test with MCP Inspector: `npx @modelcontextprotocol/inspector`

**Python:**
- Verify syntax: `python -m py_compile your_server.py`
- Test with MCP Inspector

See language-specific guides for detailed testing approaches and quality checklists.

---

### Phase 4: Create Evaluations

After implementing your MCP server, create comprehensive evaluations to test its effectiveness.

**Load [✅ Evaluation Guide](./reference/evaluation.md) for complete evaluation guidelines.**

#### 4.1 Understand Evaluation Purpose

Use evaluations to test whether LLMs can effectively use your MCP server to answer realistic, complex questions.

#### 4.2 Create 10 Evaluation Questions

To create effective evaluations, follow the process outlined in the evaluation guide:

1. **Tool Inspection**: List available tools and understand their capabilities
2. **Content Exploration**: Use READ-ONLY operations to explore available data
3. **Question Generation**: Create 10 complex, realistic questions
4. **Answer Verification**: Solve each question yourself to verify answers

#### 4.3 Evaluation Requirements

Ensure each question is:
- **Independent**: Not dependent on other questions
- **Read-only**: Only non-destructive operations required
- **Complex**: Requiring multiple tool calls and deep exploration
- **Realistic**: Based on real use cases humans would care about
- **Verifiable**: Single, clear answer that can be verified by string comparison
- **Stable**: Answer won't change over time

#### 4.4 Output Format

Create an XML file with this structure:

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
<!-- More qa_pairs... -->
</evaluation>
```

---

# Reference Files

## 📚 Documentation Library

Load these resources as needed during development:

### Core MCP Documentation (Load First)
- **MCP Protocol**: Start with sitemap at `https://modelcontextprotocol.io/sitemap.xml`, then fetch specific pages with `.md` suffix
- [📋 MCP Best Practices](./reference/mcp_best_practices.md) - Universal MCP guidelines including:
  - Server and tool naming conventions
  - Response format guidelines (JSON vs Markdown)
  - Pagination best practices
  - Transport selection (streamable HTTP vs stdio)
  - Security and error handling standards

### SDK Documentation (Load During Phase 1/2)
- **Python SDK**: Fetch from `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- **TypeScript SDK**: Fetch from `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`

### Language-Specific Implementation Guides (Load During Phase 2)
- [🐍 Python Implementation Guide](./reference/python_mcp_server.md) - Complete Python/FastMCP guide with:
  - Server initialization patterns
  - Pydantic model examples
  - Tool registration with `@mcp.tool`
  - Complete working examples
  - Quality checklist

- [⚡ TypeScript Implementation Guide](./reference/node_mcp_server.md) - Complete TypeScript guide with:
  - Project structure
  - Zod schema patterns
  - Tool registration with `server.registerTool`
  - Complete working examples
  - Quality checklist

- [🛡️ Error Handling & Resilience Guide](./reference/error_handling.md) - Production error handling:
  - Protocol vs. tool errors (`isError` flag)
  - Timeouts, retries with backoff + jitter
  - Rate limits (429 + `Retry-After`)
  - Auth / token refresh (401 handling)
  - Resilient request helper + checklist

### Evaluation Guide (Load During Phase 4)
- [✅ Evaluation Guide](./reference/evaluation.md) - Complete evaluation creation guide with:
  - Question creation guidelines
  - Answer verification strategies
  - XML format specifications
  - Example questions and answers
  - Running an evaluation with the provided scripts
