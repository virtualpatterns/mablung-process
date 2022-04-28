import { Process, ProcessDurationExceededError } from '@virtualpatterns/mablung-process'
import Test from 'ava'

const MaximumDuration = 1000
const PollInterval = parseInt(Math.ceil(MaximumDuration / 4.00))

Test('when(..., ..., ...) using a synchronous function that returns true', async (test) => {
  test.truthy(await Process.when(() => {
    return true
  }, MaximumDuration, PollInterval))
})

Test('when(..., ..., ...) using an asynchronous function that returns true', async (test) => {
  test.truthy(await Process.when(() => {
    return Promise.resolve(true)
  }, MaximumDuration, PollInterval))
})

Test('when(..., ..., ...) using a synchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return false
  }, MaximumDuration, PollInterval), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using a synchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(() => {
    throw new Error()
  }, MaximumDuration, PollInterval), { 'instanceOf': Error })
})

Test('when(..., ..., ...) using an asynchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return Promise.resolve(false)
  }, MaximumDuration, PollInterval), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using an asynchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(() => {
    return Promise.reject(new Error())
  }, MaximumDuration, PollInterval), { 'instanceOf': Error })
})
