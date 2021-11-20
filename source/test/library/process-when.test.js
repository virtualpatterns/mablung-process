import { Process, ProcessDurationExceededError } from '@virtualpatterns/mablung-process'
import Test from 'ava'

const MaximumDuration = 1000
const PollInterval = parseInt(Math.ceil(MaximumDuration / 4.00))

Test('when(..., ..., ...) using a synchronous function that returns true', async (test) => {
  test.truthy(await Process.when(MaximumDuration, PollInterval, () => {
    return true
  }))
})

Test('when(..., ..., ...) using an asynchronous function that returns true', async (test) => {
  test.truthy(await Process.when(MaximumDuration, PollInterval, () => {
    return Promise.resolve(true)
  }))
})

Test('when(..., ..., ...) using a synchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(MaximumDuration, PollInterval, () => {
    return false
  }), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using a synchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(MaximumDuration, PollInterval, () => {
    throw new Error()
  }), { 'instanceOf': Error })
})

Test('when(..., ..., ...) using an asynchronous function that returns false', async (test) => {
  await test.throwsAsync(Process.when(MaximumDuration, PollInterval, () => {
    return Promise.resolve(false)
  }), { 'instanceOf': ProcessDurationExceededError })
})

Test('when(..., ..., ...) using an asynchronous function that fails', async (test) => {
  await test.throwsAsync(Process.when(MaximumDuration, PollInterval, () => {
    return Promise.reject(new Error())
  }), { 'instanceOf': Error })
})
