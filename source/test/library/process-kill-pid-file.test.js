import { CreateLoggedProcess } from '@virtualpatterns/mablung-worker/test'
import { Process, ProcessPidFileNotExistsError } from '@virtualpatterns/mablung-process'
import { WorkerClient } from '@virtualpatterns/mablung-worker'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const Require = __require

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const PidPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.pid')
const WorkerPath = Require.resolve('./worker/process.js')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(PidPath)
})

Test.serial('killPidFile(\'...\') when \'...\' does not exist', (test) => {
  test.throws(() => { Process.killPidFile(PidPath) }, { 'instanceOf': ProcessPidFileNotExistsError })
})

Test.serial('killPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  try {

    let client = new LoggedClient(WorkerPath)

    await client.whenReady()
    await client.worker.createPidFile(PidPath)
    await test.notThrowsAsync(Promise.all([ client.whenKill(), Process.killPidFile(PidPath) ]))

  } finally {
    await FileSystem.remove(PidPath)
  }

})

Test.serial('killPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  await FileSystem.writeFile(PidPath, '100000', { 'encoding': 'utf-8' })

  try {
    test.throws(() => { Process.killPidFile(PidPath) }, { 'instanceOf': ProcessPidFileNotExistsError })
  } finally {
    await FileSystem.remove(PidPath)
  }

})
