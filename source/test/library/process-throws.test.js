import { CreateLoggedProcess } from '@virtualpatterns/mablung-worker/test'
import { WorkerClient } from '@virtualpatterns/mablung-worker'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const PidPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.pid')
const WorkerPath = FilePath.replace('process-', 'worker/process-').replace('.test', '')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(PidPath)
})

Test.serial('createPidFile(\'...\') throws Error', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.createPidFileThrowsError(PidPath), { 'message': 'createPidFileThrowsError' })
  } finally {
    await client.exit()
  }

})

Test.serial('onExit() throws Error', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(PidPath)
    await test.throwsAsync(client.worker.onExitThrowsError(), { 'message': 'onExitThrowsError' })
  } finally {
    await client.exit()
  }

})
