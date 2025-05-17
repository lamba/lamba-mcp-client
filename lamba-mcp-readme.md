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
     stdio                    HTTP/API
```

### Connection Pattern

It's important to understand the connection patterns between components:

1. **Claude to MCP Client**: 
   - Uses Standard Input/Output (stdio)
   - Claude desktop app launches the MCP client as a child process
   - Not HTTP-based but direct process communication
   - Implemented using `StdioServerTransport` from the MCP SDK

2. **MCP Client to Lambda**:
   - Uses HTTP/API over the internet
   - RESTful communication with JSON payloads
   - Standard API Gateway to Lambda integration

This architecture follows Claude's desktop app design which communicates with MCP servers using stdio for security, simplicity, and performance reasons rather than HTTP connections.

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

## AWS Lambda: Pros and Cons

### Pros of Using AWS Lambda

1. **Serverless Architecture**: No server management needed - deploy code without provisioning infrastructure
2. **Auto-scaling**: Automatically scales with the number of requests, handling traffic spikes effortlessly
3. **Pay-per-use**: Only pay for compute time consumed, with no charges when your code isn't running
4. **High Availability**: Built-in fault tolerance and availability across multiple Availability Zones
5. **Integration with AWS Services**: Seamless integration with other AWS services (S3, DynamoDB, etc.)
6. **Security**: IAM roles provide fine-grained access control; environment variables for secure configuration
7. **Event-driven Execution**: Trigger functions from various event sources (HTTP, S3, DynamoDB, etc.)
8. **Concurrency Control**: Set concurrency limits to protect downstream resources
9. **Stateless**: Encourages stateless, modular architecture, improving system design
10. **Versions and Aliases**: Support for versioning and deployment management

### Cons of Using AWS Lambda

1. **Cold Start Latency**: Initial invocation can be slow, especially for rarely-used functions
2. **Execution Limits**: Maximum execution time (15 minutes), memory constraints, and deployment package size limits
3. **Complex Debugging**: Debugging and monitoring can be more challenging than traditional deployments
4. **Limited Runtime Environment**: Restricted execution environment with limited filesystem access
5. **Learning Curve**: New paradigm that requires learning different development and deployment patterns
6. **Vendor Lock-in**: Architecture becomes tied to AWS, making migrations to other platforms harder
7. **Cost Unpredictability**: While it can be cost-effective, unpredictable usage patterns can lead to higher costs
8. **Limited Local Testing**: More difficult to test everything locally before deployment
9. **State Management**: Managing state between invocations requires external services
10. **Limited CPU Power**: Cannot leverage high-CPU instances for computation-intensive workloads

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

Using the MCP tool in Claude is straightforward:

1. **Configure Claude**: Ensure your claude_desktop_config.json correctly points to your MCP client script

2. **No Manual Client Startup Needed**: Claude will automatically:
   - Launch your MCP client as a child process when needed
   - Communicate with it through stdio channels
   - Terminate it when done

3. **Use the tool in Claude by typing**:
```
Can you help me learn about MCP using the learn_mcp tool?
```

You can also specify topics:
```
I'd like to learn about MCP architecture, can you use the learn_mcp tool?
```

When Claude needs to use your tool, it will automatically launch and manage the MCP client process - you don't need to manually start or keep it running.

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
