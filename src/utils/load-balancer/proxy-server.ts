import http from "http";
import httpProxy from "http-proxy";
import { createHash } from "crypto";

export function startProxy(workerPorts: number[], proxyPort: number): void {
  const proxy = httpProxy.createProxyServer({ ws: true });

  const healthStatus: Record<number, boolean> = {};
  workerPorts.forEach((port) => (healthStatus[port] = true));

  function getStickyPort(ip: string): number {
    const hash = createHash("md5").update(ip).digest("hex");
    const numericHash = parseInt(hash.substring(0, 8), 16);
    const port = workerPorts[numericHash % workerPorts.length];
    return port;
  }

  const server = http.createServer((req, res) => {
    const clientIp = req.socket.remoteAddress || "0.0.0.0";
    const targetPort = getStickyPort(clientIp);
    console.log(
      `🔁 [Proxy] 🌐 Request from ${clientIp} → 🛠️ Worker port ${targetPort}`
    );
    proxy.web(req, res, { target: `http://localhost:${targetPort}` }, (err) => {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(502);
      res.end("Bad Gateway");
    });
  });

  server.on("upgrade", (req, socket, head) => {
    const clientIp = req.socket.remoteAddress || "0.0.0.0";
    const targetPort = getStickyPort(clientIp);
    console.log(
      `🔌 Web socket(WS) request from  👤 ${clientIp} → 🛠️ ${targetPort} | 👷 PID ${process.pid}`
    );
    proxy.ws(req, socket, head, { target: `http://localhost:${targetPort}` });
  });

  server.listen(proxyPort, () => {
    console.log(`⚖️   [Load Balancer] Proxy running on port ${proxyPort}`);
  });
}




/* ********************************* For further implementation of Round Robin ****************************************

 let currentIndex = 0;
 let rrIndex = 0;

function getTargetPort(): number {
   const healthyPorts = workerPorts.filter((port) => healthStatus[port]);
   if (healthyPorts.length === 0) return workerPorts[0];
   const port = healthyPorts[currentIndex % healthyPorts.length];
   currentIndex = (currentIndex + 1) % healthyPorts.length;
   return port;
 }

 function getRoundRobinPort(): number {
   const healthy = workerPorts.filter(p => healthStatus[p]);
   if (!healthy.length) return workerPorts[0]; // fallback
   const port = healthy[rrIndex % healthy.length];
   rrIndex++;
   return port;
 }

********************************* For further implementation of Round Robin **************************************** */
