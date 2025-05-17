# Lambda-based MCP Server

A reference implementation of a Model Context Protocol (MCP) architecture that separates client-side protocol handling from server-side business logic.

## Project Architecture

This project demonstrates a powerful architecture pattern for implementing MCP tools:

```
┌────────────────┐       ┌────────────────┐      ┌─────────────────┐
│                │       │                │      │                 │
│   Claude AI    │◄────►│  lamba-mcp     │◄────►│  lamba-mcp      │
│   (Desktop)    │       │  client        │      │  server         │
│                │       │  (MCP Server)  │      │  (AWS Lambda)   │
└────────────────┘       └────────────────┘      └─────────────────┘
     MCP Protocol              HTTP/API
```

### Key Components:

1. **lamba-mcp-client**: 
   - A local MCP server that implements the Model Context Protocol
   - Handles communication with Claude AI
   - Forwards requests to the Lambda server
   - Formats responses according to MCP specifications

2. **lamba-mcp-server**:
   - AWS Lambda function containing the business logic
   - Contains the actual tool implementation
   - Manages resources and application-specific functionality
   - Returns structured responses

## Benefits of This Architecture

1. **Separation of Concerns**:
   - MCP protocol handling is isolated from business logic
   - Updates to one component don't require changes to the other

2. **Scalability**:
   - Lambda automatically scales with usage
   - No need to manage server infrastructure

3. **Centralized Business Logic**:
   - Core functionality lives in Lambda, making it easier to update
   - Multiple clients can use the same Lambda backend

4. **Simplified Client**:
   - Local MCP client focuses solely on protocol handling
   - Business logic complexity is handled in Lambda

5. **Independent Deployment**:
   - Update Lambda without changing client configurations
   - Evolve your API while maintaining the same interface

## Setting Up the Project

### Prerequisites

- Node.js v18+
- AWS CLI configured with appropriate permissions
- Claude AI desktop application

### Local MCP Client Setup

1. Create the client project:
```bash
mkdir -p ~/Projects/lamba-mcp-client
cd ~/Projects/lamba-mcp-client
```

2. Initialize with npm:
```bash
npm init -y
npm install @modelcontextprotocol/sdk
```

3. Update package.json:
```json
{
  "name": "lamba-mcp-client",
  "version": "1.0.0",
  "description": "MCP client for learning about Model Context Protocol",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.11.3"
  }
}
```

4. Create index.js with the MCP server implementation
5. Make it executable: `chmod +x index.js`

### Lambda Server Setup

1. Create the server project:
```bash
mkdir -p ~/Projects/lamba-mcp-server
cd ~/Projects/lamba-mcp-server
```

2. Initialize with npm:
```bash
npm init -y
```

3. Create index.js with your Lambda function implementation

4. Deploy to AWS Lambda:
```bash
# Package your Lambda function
zip -r function.zip index.js

# Deploy to AWS Lambda
aws lambda update-function-code \
  --function-name lamba-mcp-dev-mcpServer \
  --zip-file fileb://function.zip
```

### Claude AI Configuration

Update your claude_desktop_config.json with:

```json
"lamba-mcp": {
  "command": "node",
  "args": ["/path/to/your/lamba-mcp-client/index.js"]
}
```

## Usage

1. Start your MCP client:
```bash
cd ~/Projects/lamba-mcp-client
node index.js
```

2. Restart Claude desktop app if needed

3. Use the tool in Claude:
```
Can you help me learn about MCP using the learn_mcp tool?
```

## Extending the Project

This architecture can be extended to implement various useful MCP tools:

1. **Data Access Tools**: Connect to databases, APIs, or private data sources
2. **Computational Tools**: Perform complex calculations, data processing, or visualizations
3. **Integration Tools**: Connect to enterprise systems, CRMs, or other business applications
4. **AI Enhancement Tools**: Leverage specialized models or analysis capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
