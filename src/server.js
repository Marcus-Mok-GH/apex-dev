var require_server = __commonJS((exports, module2) => {
  var http = require("node:http");
  var OpenAI = require_openai();
  var NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
  var PORT = process.env.APEX_SERVER_PORT || 3579;
  var serverInstance = null;

  async function nodeReqToRequest(req) {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const method = req.method || "GET";
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (Array.isArray(val)) {
        for (const v of val) headers.append(key, v);
      } else if (val !== undefined) {
        headers.set(key, val);
      }
    }
    let body = null;
    if (method !== "GET" && method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).length > 0 ? Buffer.concat(chunks) : null;
    }
    return new Request(url.toString(), { method, headers, body });
  }

  async function sendResponse(res, fetchResponse) {
    res.statusCode = fetchResponse.status || 200;
    res.statusMessage = fetchResponse.statusText || "";
    for (const [key, val] of fetchResponse.headers.entries()) {
      res.setHeader(key, val);
    }
    if (fetchResponse.body) {
      const reader = fetchResponse.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    res.end();
  }

  async function startServer() {
    if (serverInstance)
      return serverInstance;
    const apiKey = process.env.NVIDIA_API_KEY || "";
    const upstream = new OpenAI({ apiKey, baseURL: NVIDIA_BASE_URL });
    globalThis._upstream = upstream;

    const handler = async (req, res) => {
      const request = await nodeReqToRequest(req);
      const url = new URL(request.url);
      if (url.pathname === "/health") {
        const response = new Response(JSON.stringify({ status: "ok" }), {
          headers: { "Content-Type": "application/json" }
        });
        await sendResponse(res, response);
        return;
      }
      if (url.pathname === "/v1/chat/completions" && request.method === "POST") {
        try {
          const body = await request.json();
          const isStream = body.stream === true;
          if (isStream) {
            const stream = await upstream.chat.completions.create(body);
            const encoder2 = new TextEncoder();
            const readable = new ReadableStream({
              async start(controller) {
                try {
                  for await (const chunk of stream) {
                    controller.enqueue(encoder2.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }
                  controller.enqueue(encoder2.encode(`data: [DONE]\n\n`));
                  controller.close();
                } catch (err) {
                  controller.enqueue(encoder2.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
                  controller.close();
                }
              }
            });
            const response = new Response(readable, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
              }
            });
            await sendResponse(res, response);
            return;
          }
          const result = await upstream.chat.completions.create(body);
          const response = new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
          });
          await sendResponse(res, response);
          return;
        } catch (err) {
          const status = err.status || 500;
          const response = new Response(JSON.stringify({ error: { message: err.message, status } }), {
            status,
            headers: { "Content-Type": "application/json" }
          });
          await sendResponse(res, response);
          return;
        }
      }
      if (url.pathname === "/v1/models" && request.method === "GET") {
        try {
          const models = await upstream.models.list();
          const response = new Response(JSON.stringify(models), {
            headers: { "Content-Type": "application/json" }
          });
          await sendResponse(res, response);
          return;
        } catch (err) {
          const response = new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
          await sendResponse(res, response);
          return;
        }
      }
      const response = new Response("Not Found", { status: 404 });
      await sendResponse(res, response);
    };

    serverInstance = http.createServer(handler);
    serverInstance.listen(PORT, () => {
      console.log(`Apex server listening on port ${PORT}`);
    });
    return serverInstance;
  }
  function getServerURL() {
    return `http://localhost:${PORT}/v1`;
  }
  function getPort() {
    return PORT;
  }
  function updateApiKey(key) {
    if (globalThis._upstream) {
      globalThis._upstream.apiKey = key;
    }
  }
  module2.exports = { startServer, getServerURL, getPort, updateApiKey };
});
