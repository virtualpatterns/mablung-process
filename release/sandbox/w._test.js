// // import Worker from 'jest-worker'

// import { Process } from '../index.js'

// // let worker = null

// beforeAll(() => {
//   console.log('beforeAll(() => { ... })')
//   // worker = new Worker(require.resolve('./worker.js'), { 'numWorkers': 1 })
// })

// // test('...', () => {

// //   try {
// //     console.log('BEFORE test(\'...\', async () => { ... })')
// //     return expect(worker.getKey()).resolves.not.toBeNull()
// //   } finally {
// //     console.log('AFTER test(\'...\', async () => { ... })')
// //   }

// // })

// test('...', () => {
//   expect(Process.existsPidFile('./asdf.pid')).toBeFalsy()
// })

// afterAll(() => {

//   try {
//     // return worker.end()
//   } finally {
//     console.log('afterAll(() => { ... })')
//   }

// })

//# sourceMappingURL=w._test.js.map