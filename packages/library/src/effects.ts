import {
  call,
  delay,
  fork,
  take,
  cancel,
  join,
  cancelled,
  race,
} from "redux-saga/effects";

// Retries a saga effect function a specified number of times with delay between attempts
export function* retryEffect(
  fn: (...args: any[]) => any,
  retries = 3,
  delayMs = 1000,
  ...args: any[]
) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Attempt to call the function
      return yield call(fn, ...args);
    } catch (error) {
      lastError = error;

      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        yield delay(delayMs);
      }
    }
  }

  // All attempts failed, throw the last error
  throw lastError;
}


// Calls a saga function with a timeout
// If the function does not complete within the specified time, it throws an error
export function* callWithTimeout(fn: (...args: any[]) => any, ms: number, ...args: any[]) {
  const { result, timeout } = yield race({
    result: call(fn, ...args),
    timeout: delay(ms)
  });

  if (timeout) {
    throw new Error('Timeout');
  }

  return result;
}
