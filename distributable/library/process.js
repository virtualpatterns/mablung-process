import FileSystem from 'fs';
import { Is } from '@virtualpatterns/mablung-is';
import Path from 'path';
import { ProcessArgumentError } from './error/process-argument-error.js';
import { ProcessDurationExceededError } from './error/process-duration-exceeded-error.js';
import { ProcessOptionNotSupportedError } from './error/process-option-not-supported-error.js';

class Process {
  static wait(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  static when(maximumDuration, pollInterval, pollFn) {
    return new Promise((resolve, reject) => {
      let waitLoop = function (start) {
        let duration = new Date() - start;
        let value = null;

        try {
          value = pollFn();

          if (value instanceof Promise) {
            value.then(value => {
              if (!value && duration < maximumDuration) {
                setTimeout(() => waitLoop(start), pollInterval);
              } else if (!value && duration >= maximumDuration) {
                reject(new ProcessDurationExceededError(duration, maximumDuration));
              } else {
                resolve(value);
              }
            }).catch(error => {
              if (duration < maximumDuration) {
                setTimeout(() => waitLoop(start), pollInterval);
              } else if (duration >= maximumDuration) {
                reject(error);
              }
            });
          } else {
            if (!value && duration < maximumDuration) {
              setTimeout(() => waitLoop(start), pollInterval);
            } else if (!value && duration >= maximumDuration) {
              reject(new ProcessDurationExceededError(duration, maximumDuration));
            } else {
              resolve(value);
            }
          }
        } catch (error) {
          if (duration < maximumDuration) {
            setTimeout(() => waitLoop(start), pollInterval);
          } else if (duration >= maximumDuration) {
            reject(error);
          }
        }
      };

      waitLoop(new Date());
    });
  }

  static existsPidFile(path) {
    try {
      FileSystem.accessSync(path, FileSystem.F_OK);
    } catch (error) {
      return false;
    }

    try {
      process.kill(FileSystem.readFileSync(path, {
        'encoding': 'utf-8'
      }), 0);
    } catch (error) {
      FileSystem.unlinkSync(path);
      return false;
    }

    return true;
  }

  static createPidFile(path, {
    handleExit = true,
    handleKillSignal = Is.windows() ? false : ['SIGINT', 'SIGTERM']
  } = {}) {
    if (Process._pidPath) {
      throw new ProcessArgumentError('A pid file has already been created.');
    } else if (this.existsPidFile(path)) {
      throw new ProcessArgumentError(`The path '${Path.relative('', path)}' exists.`);
    } else {
      FileSystem.writeFileSync(path, process.pid.toString(), {
        'encoding': 'utf-8'
      });

      try {
        Process._attach({
          handleExit,
          handleKillSignal
        });

        Process._pidPath = path;
        Process._pidOption = {
          handleExit,
          handleKillSignal
        };
      } catch (error) {
        FileSystem.accessSync(path, FileSystem.F_OK);
        FileSystem.unlinkSync(path);
        throw error;
      }
    }
  }

  static _attach({
    handleExit,
    handleKillSignal
  }) {
    try {
      if (handleExit) {
        Process.on('exit', Process.__onExit = code => {
          console.log(`Process.on('exit', Process.__onExit = (${code}) => { ... })`);

          try {
            Process.deletePidFile();
            /* c8 ignore next 3 */
          } catch (error) {
            console.error(error);
          }
        });
      }

      if (handleKillSignal) {
        if (Is.windows()) {
          throw new ProcessOptionNotSupportedError('handleKillSignal');
        } else {
          handleKillSignal.forEach(signal => {
            Process.on(signal, Process[`__on${signal}`] = () => {
              console.log(`Process.on('${signal}', Process.__on${signal} = () => { ... })`);

              try {
                Process.deletePidFile();

                this._exit(signal);
                /* c8 ignore next 3 */

              } catch (error) {
                console.error(error);
              }
            });
          });
        }
      }
    } catch (error) {
      this._detach({
        handleExit,
        handleKillSignal
      });

      throw error;
    }
  }

  static _exit(eventName) {
    let count = Process.listenerCount(eventName);
    /* c8 ignore next 5 */

    if (count <= 0) {
      Process.exit();
    } else {
      console.log(`Process.listenerCount('${eventName}') returned ${count}`);
    }
  }

  static deletePidFile() {
    let path = Process._pidPath;
    let option = Process._pidOption;

    if (this.existsPidFile(path)) {
      FileSystem.accessSync(path, FileSystem.F_OK);
      FileSystem.unlinkSync(path);

      this._detach(option);

      delete Process._pidPath;
      delete Process._pidOption;
    } else {
      throw new ProcessArgumentError(`Either a pid file has not been created or the path ${Is.not.undefined(path) ? `'${Path.relative('', path)}' ` : ''}does not exist.`);
    }
  }

  static _detach({
    handleExit,
    handleKillSignal
  }) {
    if (handleKillSignal) {
      handleKillSignal.forEach(signal => {
        if (Process[`__on${signal}`]) {
          Process.off(signal, Process[`__on${signal}`]);
          delete Process[`__on${signal}`];
        }
      });
    }

    if (handleExit) {
      if (Process.__onExit) {
        Process.off('exit', Process.__onExit);
        delete Process.__onExit;
      }
    }
  }

  static signalPidFile(path, signal) {
    if (this.existsPidFile(path)) {
      this.kill(FileSystem.readFileSync(path, {
        'encoding': 'utf-8'
      }), signal);
    } else {
      throw new ProcessArgumentError(`The path '${Path.relative('', path)}' does not exist.`);
    }
  }

  static killPidFile(path, killSignal = 'SIGINT') {
    return Process.signalPidFile(path, killSignal);
  }

}

Object.setPrototypeOf(Process, process);
export { Process };
//# sourceMappingURL=process.js.map