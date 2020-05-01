import FileSystem from 'fs';
import Is from '@pwn/is';
import Path from 'path';
import { ProcessArgumentError } from './error/process-argument-error.js';
import { ProcessDurationExceededError } from './error/process-duration-exceeded-error.js';

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

  static createPidFile(path, option = {
    'handleExit': true,
    // 'handleUncaughtException': true, 
    // 'handleUnhandledRejection': true, 
    'handleKillSignal': ['SIGINT', 'SIGTERM']
  }) {
    if (Process._onExit) {
      throw new ProcessArgumentError('A pid file has already been created.');
    } else if (this.existsPidFile(path)) {
      throw new ProcessArgumentError(`The path '${Path.relative('', path)}' exists.`);
    } else {
      FileSystem.writeFileSync(path, process.pid, {
        'encoding': 'utf-8'
      });

      Process._attach(option);

      Process._pidPath = path;
      Process._pidOption = option;
    }
  }

  static _attach(option) {
    if (option.handleExit) {
      Process.on('exit', Process._onExit = code => {
        console.log(`Process.on('exit', Process._onExit = (${code}) => { ... })`);

        try {
          Process.deletePidFile();
          /* c8 ignore next 3 */
        } catch (error) {
          console.error(error);
        }
      });
    } // if (option.handleUncaughtException) {
    //   Process.on('uncaughtException', Process._onUncaughtException = (error, origin) => {
    //     console.log(`Process.on('uncaughtException', Process._onUncaughtException = (error, '${origin}') => { ... })`)
    //     console.error(error)
    //     try {
    //       Process.deletePidFile()
    //       /* c8 ignore next 3 */
    //     } catch (error) {
    //       console.error(error)
    //     }
    //     this._exitOnListenerCount('uncaughtException')
    //   })
    // }
    // if (option.handleUnhandledRejection) {
    //   Process.on('unhandledRejection', Process._onUnhandledRejection = (error) => {
    //     console.log('Process.on(\'unhandledRejection\', Process._onUnhandledRejection = (error) => { ... })')
    //     console.error(error)
    //     try {
    //       Process.deletePidFile()
    //       /* c8 ignore next 3 */
    //     } catch (error) {
    //       console.error(error)
    //     }
    //     this._exitOnListenerCount('unhandledRejection')
    //   })
    // }


    if (option.handleKillSignal) {
      option.handleKillSignal.forEach(signal => {
        Process.on(signal, Process[`_on${signal}`] = () => {
          console.log(`Process.on('${signal}', Process._on${signal} = () => { ... })`);

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

  static _detach(option) {
    if (option.handleKillSignal) {
      option.handleKillSignal.forEach(signal => {
        if (Process[`_on${signal}`]) {
          Process.off(signal, Process[`_on${signal}`]);
          delete Process[`_on${signal}`];
        }
      });
    } // if (Process._onUnhandledRejection) {
    //   Process.off('unhandledRejection', Process._onUnhandledRejection)
    //   delete Process._onUnhandledRejection
    // }
    // if (Process._onUncaughtException) {
    //   Process.off('uncaughtException', Process._onUncaughtException)
    //   delete Process._onUncaughtException
    // }


    if (option.handleExit) {
      if (Process._onExit) {
        Process.off('exit', Process._onExit);
        delete Process._onExit;
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