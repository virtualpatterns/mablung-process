import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const PidPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.pid')
const Require = __require
const WorkerPath = Require.resolve('./worker/process.js')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(PidPath)
})

Test.serial('deletePidFile() when called after createPidFile(\'...\')', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(PidPath)
    await client.worker.deletePidFile()

    test.false(await FileSystem.pathExists(PidPath))

  } finally {
    await client.exit()
  }

})

Test.serial('deletePidFile() when called before another createPidFile(\'...\')', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(PidPath)
    await client.worker.deletePidFile()
    await client.worker.createPidFile(PidPath)

    test.true(await FileSystem.pathExists(PidPath))

    await client.worker.deletePidFile()

    test.false(await FileSystem.pathExists(PidPath))

  } finally {
    await client.exit()
  }

})

Test.serial('deletePidFile() when called after another deletePidFile()', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(PidPath)
    await client.worker.deletePidFile()

    await test.throwsAsync(client.worker.deletePidFile(), { 'message': 'A pid file does not exist.' })

  } finally {
    await client.exit()
  }

})
