// Direct MCP bridge through Codex's authenticated app-server. No model turn,
// token extraction, publication, or credential logging. Input: tool arguments JSON.
const { spawn } = require('node:child_process');
const { createInterface } = require('node:readline');
const fs = require('node:fs');
const path = require('node:path');

const project = path.resolve(__dirname, '../..');
const cli = path.resolve(process.env.APPDATA, 'npm/node_modules/@openai/codex/bin/codex.js');
const child = spawn(process.execPath, [cli, 'app-server', '--stdio',
  '-c', 'mcp_servers.perplexity-computer.tool_timeout_sec=600'],
  { cwd: project, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
let serial = 0;
child.stderr.on('data', () => {}); // The CLI owns authentication; do not expose its logs.
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => {
  for (const job of pending.values()) job.reject(new Error(`app-server exited (${code})`));
});
createInterface({ input: child.stdout }).on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.id !== undefined && pending.has(message.id)) {
    const job = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(job.timer);
    message.error ? job.reject(new Error(JSON.stringify(message.error))) : job.resolve(message.result);
  } else if (message.id !== undefined && message.method) {
    // Never silently authorize elicitation or any unexpected server-side action.
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: message.id,
      error: { code: -32601, message: 'Interactive approval is not available in this read-only bridge.' } }) + '\n');
  }
});
function request(method, params) {
  const id = ++serial;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 630000);
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}
(async () => {
  await request('initialize', { clientInfo: { name: 'portfolio-mcp-bridge', version: '1.0.0' },
    capabilities: { experimentalApi: true } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'initialized' }) + '\n');
  const context = await request('thread/start', { cwd: project, ephemeral: true,
    sandbox: 'read-only', approvalPolicy: 'never' });
  const threadId = context.thread.id;
  const inventory = await request('mcpServerStatus/list', { threadId, detail: 'toolsAndAuthOnly', limit: 100 });
  const server = inventory.data.find(entry => entry.name === 'perplexity-computer');
  if (!server) throw new Error('perplexity-computer is not present in MCP inventory.');
  if (!process.argv[2]) {
    console.log(JSON.stringify(server, null, 2));
  } else {
    const argumentsPath = path.resolve(process.argv[2]);
    if (!argumentsPath.startsWith(project + path.sep)) throw new Error('Input must be inside the portfolio project.');
    const args = JSON.parse(fs.readFileSync(argumentsPath, 'utf8'));
    const tool = process.argv[3] || 'call_perplexity_computer';
    if (!['call_perplexity_computer', 'read_thread', 'create_attachment_upload'].includes(tool)) {
      throw new Error('This bridge only supports consultation, reading and scoped attachments.');
    }
    if (args.include_local_direction) {
      delete args.include_local_direction;
      args.message += '\n\nDOCUMENTO RECEBIDO DO USUÁRIO:\n' + fs.readFileSync(path.join(__dirname, 'DIRECAO-03-MECANISMOS.md'), 'utf8');
    }
    const savedThread = path.join(project, '.codex/pplx-thread');
    if (tool === 'call_perplexity_computer' && !args.thread_id && fs.existsSync(savedThread)) {
      args.thread_id = fs.readFileSync(savedThread, 'utf8').trim();
    }
    const result = await request('mcpServer/tool/call', { threadId, server: 'perplexity-computer',
      tool, arguments: args });
    fs.mkdirSync(path.join(__dirname, 'conversas'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'conversas', path.basename(argumentsPath, '.json') + '-resposta.json'),
      JSON.stringify(result, null, 2));
    // Persist only an actual thread_id returned by Perplexity, never the app-server
    // thread id, a visible session URL, or a placeholder after an unsuccessful call.
    function findThread(value) {
      if (!value || typeof value !== 'object') return null;
      if (typeof value.thread_id === 'string' && /^[0-9a-f-]{36}$/i.test(value.thread_id)) return value.thread_id;
      for (const nested of Object.values(value)) {
        let parsed = nested;
        if (typeof nested === 'string') { try { parsed = JSON.parse(nested); } catch { continue; } }
        const found = findThread(parsed);
        if (found) return found;
      }
      return null;
    }
    const realThread = findThread(result);
    if (realThread) { fs.mkdirSync(path.dirname(savedThread), { recursive: true }); fs.writeFileSync(savedThread, realThread + '\n'); }
    console.log(JSON.stringify(result, null, 2));
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => { child.stdin.end(); child.kill(); });
