import { Process } from '../../index.js';

export function existsPidFile(...parameter) {
  return Process.existsPidFile(...parameter);
}

export function createPidFile(...parameter) {
  return Process.createPidFile(...parameter);
}

export function deletePidFile() {
  return Process.deletePidFile();
}

export function throwUncaughtException() {
  setImmediate(() => {throw new Error('throwUncaughtException() { ... }');});
}
//# sourceMappingURL=worker.js.map