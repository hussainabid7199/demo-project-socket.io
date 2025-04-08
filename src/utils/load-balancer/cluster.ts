import cluster from "node:cluster";
import { cpus } from "node:os";

/**
 * Start a cluster of worker processes to share the server load.
 * @param callback - The server-starting function to run in each worker.
 */
export function startCluster(callback: () => void): void {
  const numCPUs = cpus().length;
  if (cluster.isPrimary) {
    console.table({
      Process: `Primary process ${process.pid} is running`,
      Spawning: `Spawning ${numCPUs} workers...\n`,
    });

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.table({ code: code, signal: signal });
      console.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    console.log(`🚀 Worker ${process.pid} started`);
    callback();
  }
}
