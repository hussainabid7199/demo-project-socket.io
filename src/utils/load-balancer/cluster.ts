import cluster from "node:cluster";
import { cpus } from "node:os";

export function startCluster(workerStarter: () => void, basePort: number): void {
  const numCPUs = cpus().length;

  if (cluster.isPrimary) {
    console.table({
      Process: `Primary process ${process.pid} is running`,
      Spawning: `Spawning ${numCPUs} workers...`,
    });

    for (let i = 0; i < numCPUs; i++) {
      const port = basePort + i;
      cluster.fork({ PORT: port.toString() });
    }

    cluster.on("exit", (worker) => {
      console.warn(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    workerStarter();
  }
}
