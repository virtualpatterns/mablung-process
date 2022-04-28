import { Process, ProcessDurationExceededError } from '@virtualpatterns/mablung-process'
import Test from 'ava'

const MaximumDuration = 1000
const PollInterval = parseInt(Math.ceil(MaximumDuration / 4.00))

Test('when(..., ..., ...) using a synchronous function that returns true', async (test) => {
  test.truthy(await Process.when(() => {
    return true
  }, PollInterval, MaximumDuration))
})

Test('when(..., ..., ...) using an asynchronous function that returns true', async (test) => {
  test.truthy(await Process.when(() => {
    return Promise.resolve(true)
  }, PollInterval, MaximumDuration))
})

Test('when(..., ..., ...) using a synchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return false
  }, PollInterval, MaximumDuration), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using a synchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(() => {
    throw new Error()
  }, PollInterval, MaximumDuration), { 'instanceOf': Error })
})

Test('when(..., ..., ...) using an asynchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return Promise.resolve(false)
  }, PollInterval, MaximumDuration), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using an asynchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return Promise.reject(new Error())
  }, PollInterval, MaximumDuration), { 'instanceOf': Error })
})
