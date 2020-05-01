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
//# sourceMappingURL=worker.js.map