import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { Is } from '@virtualpatterns/mablung-is'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Process } from '../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const WorkerPath = FilePath.replace('process-', 'worker/process-').replace('.test', '')

const PidPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.pid')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(PidPath)
})

Test.serial('createPidFile(\'...\') when \'...\' does not exist', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(PidPath)

    try {
      test.true(await FileSystem.pathExists(PidPath))
      test.is(parseInt(await FileSystem.readFile(PidPath, { 'encoding': 'utf-8' })), client.pid)
    } finally {
      await client.worker.deletePidFile()
    }

  } finally {
    await client.exit()
  }

})

Test.serial('createPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(PidPath, Process.pid.toString(), { 'encoding': 'utf-8' })

    try {
      await test.throwsAsync(client.worker.createPidFile(PidPath), { 'message': 'The pid file \'data/test/library/process-create-pid-file.pid\' exists.' })
    } finally {
      await FileSystem.remove(PidPath)
    }

  } finally {
    await client.exit()
  }

})

Test.serial('createPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(PidPath, '100000', { 'encoding': 'utf-8' })

    await client.worker.createPidFile(PidPath)

    try {
      test.true(await FileSystem.pathExists(PidPath))
      test.is(parseInt(await FileSystem.readFile(PidPath, { 'encoding': 'utf-8' })), client.pid)
    } finally {
      await client.worker.deletePidFile()
    }

  } finally {
    await client.exit()
  }

})

Test.serial('createPidFile(\'...\') when \'...\' exists and it is called again', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(PidPath)

    try {
      await test.throwsAsync(client.worker.createPidFile(PidPath), { 'message': 'The pid file \'data/test/library/process-create-pid-file.pid\' exists.' })
    } finally {
      await client.worker.deletePidFile()
    }

  } finally {
    await client.exit()
  }

})

Test.serial('createPidFile(\'...\', { \'handleExit\': true })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(PidPath, { 'handleExit': true })
  } finally {
    await client.exit()
  }

  test.false(await FileSystem.pathExists(PidPath))

})

Test.serial('createPidFile(\'...\', { \'handleExit\': false })', async (test) => {

  try {

    let client = new LoggedClient(WorkerPath)

    await client.whenReady()

    try {
      await client.worker.createPidFile(PidPath, { 'handleExit': false })
    } finally {
      await client.exit()
    }

    test.true(await FileSystem.pathExists(PidPath))

  } finally {
    await FileSystem.remove(PidPath)
  }

})

Test.serial('createPidFile(\'...\', { \'handleExit\': true }) on uncaught exception', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(PidPath, { 'handleExit': true })
  } finally {
    await Promise.all([ client.whenExit(), client.worker.throwUncaughtException() ])
  }

  test.false(await FileSystem.pathExists(PidPath))

})

Test.serial('createPidFile(\'...\', { \'handleExit\': false }) on uncaught exception', async (test) => {

  try {

    let client = new LoggedClient(WorkerPath)

    await client.whenReady()

    try {
      await client.worker.createPidFile(PidPath, { 'handleExit': false })
    } finally {
      await Promise.all([ client.whenExit(), client.worker.throwUncaughtException() ])
    }

    test.true(await FileSystem.pathExists(PidPath))

  } finally {
    await FileSystem.remove(PidPath)
  }

})

;(Is.windows() ? Test.serial.skip : Test.serial)('createPidFile(\'...\', { \'handleExit\': true }) on SIGINT', async (test) => {

  try {

    let client = new LoggedClient(WorkerPath)

    await client.whenReady()

    try {
      await client.worker.createPidFile(PidPath, { 'handleExit': true })
    } finally {
      // await Promise.all([ client.whenKill(), client.send('SIGINT') ])
      await client.kill()
    }

    test.true(await FileSystem.pathExists(PidPath))

  } finally {
    await FileSystem.remove(PidPath)
  }

})

;(Is.windows() ? Test.serial.skip : Test.serial)('createPidFile(\'...\', { \'handleExit\': false }) on SIGINT', async (test) => {

  try {

    let client = new LoggedClient(WorkerPath)

    await client.whenReady()

    try {
      await client.worker.createPidFile(PidPath, { 'handleExit': false })
    } finally {
      // await Promise.all([ client.whenKill(), client.send('SIGINT') ])
      await client.kill()
    }

    test.true(await FileSystem.pathExists(PidPath))

  } finally {
    await FileSystem.remove(PidPath)
  }

})
