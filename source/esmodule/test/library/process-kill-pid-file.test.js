import { ChildProcessKilledError } from '@virtualpatterns/mablung-worker'
import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Path } from '@virtualpatterns/mablung-path'
import FileSystem from 'fs-extra'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, './worker/process.js')

Test.before(async () => {
  await FileSystem.remove(DataPath)
  return FileSystem.ensureDir(DataPath)
})

Test.beforeEach(async (test) => {

  let id = await CreateRandomId()
  let logPath = Path.resolve(DataPath, `${id}.log`)
  let pidPath = Path.resolve(DataPath, `${id}.pid`)

  test.context.logPath = logPath
  test.context.pidPath = pidPath

})

Test('killPidFile(\'...\') when \'...\' does not exist', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.killPidFile(test.context.pidPath), { 'message': `The pid file '${Path.trim(test.context.pidPath)}' does not exist.` })
  } finally {
    await client.exit()
  }

})

Test('killPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  try {

    let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

    await client.whenReady()
    await client.worker.createPidFile(test.context.pidPath)
    await test.throwsAsync(client.worker.killPidFile(test.context.pidPath), { 'instanceOf': ChildProcessKilledError })

  } finally {
    await FileSystem.remove(test.context.pidPath)
  }

})

Test('killPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  await FileSystem.writeFile(test.context.pidPath, '100000', { 'encoding': 'utf-8' })

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.killPidFile(test.context.pidPath), { 'message': `The pid file '${Path.trim(test.context.pidPath)}' does not exist.` })
  } finally {
    await client.exit()
  }

})
