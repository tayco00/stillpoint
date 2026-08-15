import http from "node:http";
import { createGzip } from "node:zlib";

const listenPort = Number(process.argv[2] ?? 3002);
const upstreamPort = Number(process.argv[3] ?? 3001);

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: upstreamPort,
      path: request.url,
      method: request.method,
      headers: { ...request.headers, host: `localhost:${upstreamPort}`, "accept-encoding": "identity" },
    },
    (upstreamResponse) => {
      const headers = { ...upstreamResponse.headers };
      const contentType = String(headers["content-type"] ?? "");
      const compressible = /javascript|json|text|svg|xml/.test(contentType);
      const acceptsGzip = String(request.headers["accept-encoding"] ?? "").includes("gzip");

      delete headers["content-length"];
      delete headers.etag;
      if (compressible && acceptsGzip) {
        headers["content-encoding"] = "gzip";
        headers.vary = "Accept-Encoding";
      }
      response.writeHead(upstreamResponse.statusCode ?? 502, headers);
      if (compressible && acceptsGzip) upstreamResponse.pipe(createGzip()).pipe(response);
      else upstreamResponse.pipe(response);
    },
  );
  upstream.on("error", () => {
    response.writeHead(502).end("Audit upstream unavailable");
  });
  request.pipe(upstream);
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`Compressed audit server: http://127.0.0.1:${listenPort}`);
});
