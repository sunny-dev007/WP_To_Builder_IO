const https = require('https');
const http = require('http');

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => input += chunk);
    process.stdin.on('end', () => resolve(JSON.parse(input)));
    process.stdin.on('error', err => reject(err));
  });
}

async function callWebhook(documentUrl) {
  const data = JSON.stringify({ document_url: documentUrl });

  const webhookUrl = 'https://n8n.srv810548.hstgr.cloud/webhook/summarize-documents';
  const url = new URL(webhookUrl);

  const lib = url.protocol === 'https:' ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = lib.request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          const isJson = contentType.includes('application/json');
          const parsed = isJson ? JSON.parse(body) : { summary: body };
          resolve(parsed);
        } catch (e) {
          reject(`Failed to parse response: ${e.message}`);
        }
      });
    });

    req.on('error', e => reject(`Request error: ${e.message}`));
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const input = await readStdin();
    const result = await callWebhook(input.document_url);
    const output = {
      summary: result.summary || 'No summary returned.'
    };
    process.stdout.write(JSON.stringify(output));
  } catch (err) {
    process.stdout.write(JSON.stringify({ summary: `Error: ${err}` }));
  }
})();
