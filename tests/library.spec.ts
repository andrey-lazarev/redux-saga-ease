import { runSaga } from 'redux-saga'
import { createApiSaga } from '../packages/library/src/createApiSaga'

test('createApiSaga worker returns data', async () => {
  const fake = { get: jest.fn(() => Promise.resolve({ id: 1 })) }
  const saga = createApiSaga({ request: ({ id }: any) => fake.get(id) })
  const res = await runSaga({}, saga.worker, { payload: { id: 1 } }).toPromise()
  expect(res).toEqual({ id: 1 })
})
