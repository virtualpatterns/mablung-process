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

Test.serial('existsPidFile(\'...\') when \'...\' does not exist', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    test.false(await client.worker.existsPidFile(PidPath))
  } finally {
    await client.exit()
  }

})

Test.serial('existsPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(PidPath, client.pid.toString(), { 'encoding': 'utf-8' })

    try {
      test.true(await client.worker.existsPidFile(PidPath))
    } finally {
      await FileSystem.remove(PidPath)
    }

  } finally {
    await client.exit()
  }

})

Test.serial('existsPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(PidPath, '100000', { 'encoding': 'utf-8' })

    test.false(await client.worker.existsPidFile(PidPath))
    test.false(await FileSystem.pathExists(PidPath))

  } finally {
    await client.exit()
  }

})
