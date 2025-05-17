#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Define the MCP learning tool
const LEARN_MCP_TOOL = {
    name: "learn_mcp",
    description: "Provides educational resources about Model Context Protocol (MCP). " +
        "This tool helps you learn about building and using MCP servers by returning " +
        "documentation links, tutorials, examples, and other learning materials. " +
        "Each call returns a different resource to explore the MCP ecosystem.",
    inputSchema: {
        type: "object",
        properties: {
            topic: {
                type: "string",
                description: "Optional topic to focus on (e.g., 'implementation', 'architecture', 'examples')"
            }
        }
    }
};

// Lambda server endpoint
const LAMBDA_ENDPOINT = 'https://dgtfn7jd9f.execute-api.us-east-1.amazonaws.com/dev/';

// Server implementation
const server = new Server({
    name: "lamba-mcp-client",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});

// Function to call the Lambda server
async function learnMcp(topic = '') {
    try {
        console.error(`Calling Lambda MCP server with topic: "${topic}"`);
        
        // Call Lambda function
        const response = await fetch(LAMBDA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'tool_call',
                name: 'learn_mcp',
                parameters: { topic }
            })
        });

        if (!response.ok) {
            throw new Error(`Lambda API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.error(`Received response from Lambda server: ${JSON.stringify(data)}`);
        return data;
    } catch (error) {
        console.error("Error calling Lambda MCP server:", error);
        // Fallback response if Lambda call fails
        return {
            title: "MCP Documentation",
            description: "Official Model Context Protocol documentation",
            url: "https://modelcontextprotocol.io/docs/",
            resource_type: "documentation"
        };
    }
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Handling list tools request");
    return { tools: [LEARN_MCP_TOOL] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        console.error(`Handling tool call: ${name} with args: ${JSON.stringify(args)}`);
        
        if (!args) {
            throw new Error("No arguments provided");
        }

        switch (name) {
            case "learn_mcp": {
                const { topic = '' } = args;
                const result = await learnMcp(topic);
                
                // Format the response nicely
                const formattedText = 
                    `📚 ${result.title || 'MCP Learning Resource'}\n\n` +
                    `${result.description || 'A resource for learning about MCP'}\n\n` +
                    `🔗 ${result.url || 'https://modelcontextprotocol.io/'}\n\n` +
                    `Type: ${result.resource_type || 'documentation'}`;
                
                return {
                    content: [{ type: "text", text: formattedText }],
                    isError: false,
                };
            }
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (error) {
        console.error(`Error handling tool call: ${error.message}`);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});

// Start the server
async function runServer() {
    const transport = new StdioServerTransport();
    console.error("Starting lamba-mcp-client...");
    await server.connect(transport);
    console.error("lamba-mcp-client running on stdio");
}

// Handle process signals
process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down...');
    process.exit(0);
});

// Run the server
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});