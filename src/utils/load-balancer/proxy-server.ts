import http from "http";
import httpProxy from "http-proxy";

export function startProxy(workerPorts: number[], proxyPort: number): void {
  let currentIndex = 0;
  const proxy = httpProxy.createProxyServer({ ws: true });

  const healthStatus: Record<number, boolean> = {};
  workerPorts.forEach((port) => (healthStatus[port] = true));

  function getTargetPort(): number {
    const healthyPorts = workerPorts.filter((port) => healthStatus[port]);
    if (healthyPorts.length === 0) return workerPorts[0];
    const port = healthyPorts[currentIndex % healthyPorts.length];
    currentIndex = (currentIndex + 1) % healthyPorts.length;
    return port;
  }

  const server = http.createServer((req, res) => {
    const clientIp = req.socket.remoteAddress || "0.0.0.0";
    const targetPort = getTargetPort();
    console.log(`🔁 [Proxy] 🌐 Request from ${clientIp} → 🛠️ Worker port ${targetPort}`);
    proxy.web(req, res, { target: `http://localhost:${targetPort}` }, (err) => {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(502);
      res.end("Bad Gateway");
    });
  });

  server.on("upgrade", (req, socket, head) => {
    const clientIp = req.socket.remoteAddress || "0.0.0.0";
    const targetPort = getTargetPort();
    console.log(`🔌 Web socket(WS) request from  👤 ${clientIp} → 🛠️ ${targetPort} | 👷 PID ${process.pid}`);
    proxy.ws(req, socket, head, { target: `http://localhost:${targetPort}` });
  });

  server.listen(proxyPort, () => {
    console.log(`⚖️   [Load Balancer] Proxy running on port ${proxyPort}`);
  });
}
