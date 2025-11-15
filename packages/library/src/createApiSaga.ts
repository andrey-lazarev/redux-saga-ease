import { UnknownAction } from 'redux'
import { retryEffect } from './effects'
import { CreateApiSagaOpts } from './types';

export function createApiSaga(opts: CreateApiSagaOpts) {
  const { request, take = "takeLatest", retries = 1, retryDelay = 1000 } = opts;

  function* worker(action: UnknownAction) {
    try {
      const res = yield* retryEffect(
        request,
        retries,
        retryDelay,
        action.payload
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  return { worker, take };
}
