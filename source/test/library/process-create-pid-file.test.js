import FileSystem from 'fs-extra'
import { Is } from '@virtualpatterns/mablung-is'
import Test from 'ava'
import { WorkerClient } from '@virtualpatterns/mablung-worker'

import { Process, PidFileExistsProcessError } from '../../index.js'

const Require = __require

Test.before((test) => {
  test.context.basePath = 'process/pid/create-pid-file'
})

Test.serial('Process.createPidFile(path) when path exists and is valid', async (test) => {

  let path = `${test.context.basePath}/exists-valid.pid`

  await FileSystem.ensureDir(test.context.basePath)
  await FileSystem.writeFile(path, process.pid.toString(), { 'encoding': 'utf-8' })

  try {
    test.throws(() => Process.createPidFile(path), { 'instanceOf': PidFileExistsProcessError })
  } finally {
    await FileSystem.remove(path)
  }

})

Test.serial('Process.createPidFile(path) when path does not exist', async (test) => {

  let path = `${test.context.basePath}/not-exists.pid`

  Process.createPidFile(path)

  try {
    test.true(await FileSystem.pathExists(path))
    test.is(parseInt(await FileSystem.readFile(path, { 'encoding': 'utf-8' })), process.pid)
  } finally {
    Process.deletePidFile()
  }

})

Test.serial('Process.createPidFile(path) when path exists and is invalid', async (test) => {

  let path = `${test.context.basePath}/exists-invalid.pid`

  await FileSystem.ensureDir(test.context.basePath)
  await FileSystem.writeFile(path, '100000', { 'encoding': 'utf-8' })

  Process.createPidFile(path)

  try {
    test.true(await FileSystem.pathExists(path))
    test.is(parseInt(await FileSystem.readFile(path, { 'encoding': 'utf-8' })), process.pid)
  } finally {
    Process.deletePidFile()
  }

})

Test.serial('Process.createPidFile(path) when called twice', (test) => {

  let path = `${test.context.basePath}/twice.pid`

  Process.createPidFile(path)

  try {
    test.throws(() => Process.createPidFile(path), { 'instanceOf': PidFileExistsProcessError })
  } finally {
    Process.deletePidFile()
  }

})

Test.serial('Process.createPidFile(path) when using a worker', async (test) => {

  let path = `${test.context.basePath}/worker.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  try {

    await worker.module.createPidFile(path)

    try {
      test.true(await FileSystem.pathExists(path))
      test.is(parseInt(await FileSystem.readFile(path, { 'encoding': 'utf-8' })), worker.pid)
    } finally {
      await worker.module.deletePidFile()
    }

  } finally {
    await worker.exit()
  }

})

Test.serial('Process.createPidFile(path) on exit', async (test) => {

  let path = `${test.context.basePath}/on-exit.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  try {
    await worker.module.createPidFile(path, { 'handleExit': true, 'handleKillSignal': false })
  } finally {
    await worker.exit()
  }

  test.false(await FileSystem.pathExists(path))

})

Test.serial('Process.createPidFile(path) on uncaught exception', async (test) => {

  let path = `${test.context.basePath}/on-uncaught-exception.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  try {
    await worker.module.createPidFile(path, { 'handleExit': true, 'handleKillSignal': false })
  } finally {
    await worker.module.throwUncaughtException()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  test.false(await FileSystem.pathExists(path))

})

Test.serial('Process.createPidFile(path) on SIGINT optionally throws OptionNotSupportedProcessError', async (test) => {

  let path = `${test.context.basePath}/on-sigint.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  if (Is.windows()) {

    try {
      await test.throwsAsync(worker.module.createPidFile(path, { 'handleExit': true, 'handleKillSignal': [ 'SIGINT' ] }), { 'instanceOf': Error })
    } finally {
      await worker.exit()
    }
    
  } else {

    try {
      await worker.module.createPidFile(path, { 'handleExit': false, 'handleKillSignal': [ 'SIGINT' ] })
    } finally {
      Process.killPidFile(path, 'SIGINT')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

  }

  test.false(await FileSystem.pathExists(path))

})

Test.serial('Process.createPidFile(path) on SIGTERM optionally throws OptionNotSupportedProcessError', async (test) => {

  let path = `${test.context.basePath}/on-sigterm.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  if (Is.windows()) {

    try {
      await test.throwsAsync(worker.module.createPidFile(path, { 'handleExit': false, 'handleKillSignal': [ 'SIGTERM' ] }), { 'instanceOf': Error })
    } finally {
      await worker.exit()
    }
    
  } else {

    try {
      await worker.module.createPidFile(path, { 'handleExit': false, 'handleKillSignal': [ 'SIGTERM' ] })
    } finally {
      Process.killPidFile(path, 'SIGTERM')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

  }

  test.false(await FileSystem.pathExists(path))

})
