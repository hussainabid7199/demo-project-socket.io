import cluster from "node:cluster";
import { cpus } from "node:os";

export function startCluster(
  workerStarter: () => void,
  basePort: number
): void {
  const numCPUs = cpus().length;
  const portMap = new Map<number, number>();

  if (cluster.isPrimary) {
    console.table({
      Process: `Primary process ${process.pid} is running`,
      Spawning: `Spawning ${numCPUs} workers...`,
    });

    for (let i = 0; i < numCPUs; i++) {
      const port = basePort + i;
      const worker = cluster.fork({ PORT: port.toString() });
      portMap.set(worker.id, port);
    }

    cluster.on("exit", (worker) => {
      const port = portMap.get(worker.id);
      portMap.delete(worker.id);
      if (port !== undefined) {
        setTimeout(() => {
          console.warn(`Worker ${worker.process.pid} died. Restarting...`);
          const newWorker = cluster.fork({ PORT: port.toString() });
          portMap.set(newWorker.id, port);
        }, 10000);
      }
    });
  } else {
    workerStarter();
  }
}
