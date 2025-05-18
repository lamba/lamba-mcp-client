#!/usr/bin/env node

// MCP Client Tester
// This script tests your MCP client by simulating Claude's interaction with it
// You don't need to have the client running to run this test - the test script will run the client

// Usage:
//   node test.js [path-to-mcp-client] [topic]
//
// Examples:
//   node test.js                           # Test with default client and topic
//   node test.js ./index.js architecture   # Test with specific topic
//   node test.js ./custom-client.js security  # Test a different client with a topic

// Ignore the "Method not found" error for tools/invoke - it's just confirming that MCP client only supports tools/call, which is what Claude actually uses. 
// Also, it seems Claude gracefully handles tools/invoke - logs an error and internally tries tools/call instead.

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MCP_CLIENT_PATH = process.argv[2] || join(__dirname, 'index.js');
const DEFAULT_TOPIC = 'architecture';
const topic = process.argv[3] || DEFAULT_TOPIC;

// Test the MCP client
async function testMcpClient() {
  console.log(`Testing MCP client at: ${MCP_CLIENT_PATH}`);
  console.log(`Using topic: ${topic}`);
  
  // Spawn the MCP client process
  const mcpProcess = spawn('node', [MCP_CLIENT_PATH]);
  
  // Log stdout and stderr
  mcpProcess.stdout.on('data', (data) => {
    console.log(`[STDOUT]: ${data.toString()}`);
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.error(`[STDERR]: ${data.toString()}`);
  });
  
  // First send initialize request
  console.log('\nSending initialize request...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '0.1.0'
      }
    }
  };
  
  mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Wait for result
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Send the tools/call request - this is what Claude actually uses
  console.log('\nSending tools/call request...');
  const callRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'learn_mcp',
      arguments: {
        topic: topic
      }
    }
  };
  
  mcpProcess.stdin.write(JSON.stringify(callRequest) + '\n');
  
  // Wait for result
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Also test tools/invoke for completeness
  console.log('\nSending tools/invoke request (for comparison)...');
  const invokeRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/invoke',
    params: {
      name: 'learn_mcp',
      arguments: {
        topic: topic
      }
    }
  };
  
  mcpProcess.stdin.write(JSON.stringify(invokeRequest) + '\n');
  
  // Wait for result
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Close stdin to signal end of input
  mcpProcess.stdin.end();
  
  // Wait for process to exit
  await new Promise(resolve => mcpProcess.on('close', resolve));
  
  console.log('\nTest completed.');
}

// Run the test
testMcpClient().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});