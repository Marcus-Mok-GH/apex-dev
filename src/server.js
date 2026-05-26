var require_server = __commonJS((exports, module2) => {
  var OpenAI = require_openai();
  var NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
  var PORT = process.env.APEX_SERVER_PORT || 3579;
  var serverInstance = null;
  async function startServer() {
    if (serverInstance)
      return serverInstance;
    const apiKey = process.env.NVIDIA_API_KEY || "";
    const upstream = new OpenAI({ apiKey, baseURL: NVIDIA_BASE_URL });
    serverInstance = Bun.serve({
      port: PORT,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/health") {
          return new Response(JSON.stringify({ status: "ok" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
        if (url.pathname === "/v1/chat/completions" && req.method === "POST") {
          try {
            const body = await req.json();
            const isStream = body.stream === true;
            if (isStream) {
              const stream = await upstream.chat.completions.create(body);
              const encoder2 = new TextEncoder;
              const readable = new ReadableStream({
                async start(controller) {
                  try {
                    for await (const chunk of stream) {
                      controller.enqueue(encoder2.encode(`data: ${JSON.stringify(chunk)}

`));
                    }
                    controller.enqueue(encoder2.encode(`data: [DONE]

`));
                    controller.close();
                  } catch (err) {
                    controller.enqueue(encoder2.encode(`data: ${JSON.stringify({ error: err.message })}

`));
                    controller.close();
                  }
                }
              });
              return new Response(readable, {
                headers: {
                  "Content-Type": "text/event-stream",
                  "Cache-Control": "no-cache",
                  Connection: "keep-alive"
                }
              });
            }
            const result = await upstream.chat.completions.create(body);
            return new Response(JSON.stringify(result), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (err) {
            const status = err.status || 500;
            return new Response(JSON.stringify({ error: { message: err.message, status } }), {
              status,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        if (url.pathname === "/v1/models" && req.method === "GET") {
          try {
            const models = await upstream.models.list();
            return new Response(JSON.stringify(models), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return new Response("Not Found", { status: 404 });
      }
    });
    return serverInstance;
  }
  function getServerURL() {
    return `http://localhost:${PORT}/v1`;
  }
  function getPort() {
    return PORT;
  }
  module2.exports = { startServer, getServerURL, getPort };
});

