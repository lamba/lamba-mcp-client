#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Lambda server endpoint
const LAMBDA_ENDPOINT = 'https://dgtfn7jd9f.execute-api.us-east-1.amazonaws.com/dev/';

// Create a server following the example pattern
const server = new Server({
    name: "lamba-mcp-client",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {
            learn_mcp: {
                name: "learn_mcp",
                description: "Provides educational resources about Model Context Protocol (MCP)",
                inputSchema: {
                    type: "object",
                    properties: {
                        topic: { 
                            type: "string", 
                            description: "Optional topic to focus on (e.g., 'implementation', 'architecture', 'examples')" 
                        }
                    }
                }
            }
        },
    },
});

// Tool handlers - following the example pattern
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "learn_mcp",
            description: "Provides educational resources about Model Context Protocol (MCP)",
            inputSchema: {
                type: "object",
                properties: {
                    topic: { 
                        type: "string", 
                        description: "Optional topic to focus on (e.g., 'implementation', 'architecture', 'examples')" 
                    }
                }
            }
        }
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        console.error(`Handling tool call: ${name} with args: ${JSON.stringify(args)}`);
        
        if (name !== "learn_mcp") {
            console.error(`Unknown tool: ${name}`);
            return {
                content: [{ type: "text", text: `Unknown tool: ${name}` }],
                isError: true,
            };
        }

        const topic = args?.topic || '';
        console.error(`Calling Lambda with topic: "${topic}"`);
        
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

        const result = await response.json();
        console.error(`Received response: ${JSON.stringify(result)}`);
        
        // Format the response for Claude
        const formattedText = 
            `📚 ${result.title || 'MCP Learning Resource'}\n\n` +
            `${result.description || 'A resource for learning about MCP'}\n\n` +
            `🔗 ${result.url || 'https://modelcontextprotocol.io/'}\n\n` +
            `Type: ${result.resource_type || 'documentation'}`;
        
        return {
            content: [{ type: "text", text: formattedText }],
            isError: false,
        };
    } catch (error) {
        console.error(`Error handling tool call: ${error.message}`);
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// Start the server - using connect as shown in the example
async function main() {
    try {
        const transport = new StdioServerTransport();
        console.error("Starting lamba-mcp-client...");
        await server.connect(transport);
        console.error("lamba-mcp-client running on stdio");
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
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
main();