import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Path } from '@virtualpatterns/mablung-path'
import { Process } from '@virtualpatterns/mablung-process'
import FileSystem from 'fs-extra'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, './worker/process-create-pid-file.js') // FilePath.replace('process-', 'worker/process-').replace('.test', '')

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

Test('createPidFile(\'...\') when \'...\' does not exist', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(test.context.pidPath)

    test.true(await FileSystem.pathExists(test.context.pidPath))
    test.is(parseInt(await FileSystem.readFile(test.context.pidPath, { 'encoding': 'utf-8' })), client.pid)

  } finally {
    await client.exit()
  }

})

Test('createPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await FileSystem.writeFile(test.context.pidPath, Process.pid.toString(), { 'encoding': 'utf-8' })
    await test.throwsAsync(client.worker.createPidFile(test.context.pidPath), { 'instanceOf': Error })
  } finally {
    await client.exit()
  }

})

Test('createPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(test.context.pidPath, '100000', { 'encoding': 'utf-8' })

    await client.worker.createPidFile(test.context.pidPath)

    test.true(await FileSystem.pathExists(test.context.pidPath))
    test.is(parseInt(await FileSystem.readFile(test.context.pidPath, { 'encoding': 'utf-8' })), client.pid)

  } finally {
    await client.exit()
  }

})

Test('createPidFile(\'...\') when \'...\' exists and it is called again', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(test.context.pidPath)
    await test.throwsAsync(client.worker.createPidFile(test.context.pidPath), { 'instanceOf': Error })
  } finally {
    await client.exit()
  }

})

Test('createPidFile(\'...\', true)', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(test.context.pidPath, true)
  } finally {
    await client.exit()
  }

  test.false(await FileSystem.pathExists(test.context.pidPath))

})

Test('createPidFile(\'...\', false)', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(test.context.pidPath, false)
  } finally {
    await client.exit()
  }

  test.true(await FileSystem.pathExists(test.context.pidPath))

})

Test('createPidFile(\'...\', true) on uncaught exception', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(test.context.pidPath, true)
  } finally {
    await Promise.all([ client.whenExit(), client.worker.throwUncaughtException() ])
  }

  test.false(await FileSystem.pathExists(test.context.pidPath))

})

Test('createPidFile(\'...\', false) on uncaught exception', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.createPidFile(test.context.pidPath, false)
  } finally {
    await Promise.all([ client.whenExit(), client.worker.throwUncaughtException() ])
  }

  test.true(await FileSystem.pathExists(test.context.pidPath))

})
