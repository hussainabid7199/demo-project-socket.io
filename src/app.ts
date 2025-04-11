import cluster from "node:cluster";
import os from "node:os";
import { startServer } from "./server";
import { startCluster } from "./utils/load-balancer/cluster";
import { startProxy } from "./utils/load-balancer/proxy-server";

const BASE_WORKER_PORT = 3001;
const PROXY_PORT = 8000;
const numCPUs = os.cpus().length;
const workerPorts: number[] = [];

for (let i = 0; i < numCPUs; i++) {
  workerPorts.push(BASE_WORKER_PORT + i);
}

if (cluster.isPrimary) {
  startCluster(() => {
  }, BASE_WORKER_PORT);
  startProxy(workerPorts, PROXY_PORT);
} else {
  startServer();
}
