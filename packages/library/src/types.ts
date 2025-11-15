export type TakeStrategy = 'takeEvery' | 'takeLatest' | 'takeLeading'
export interface AnyObject { [k: string]: any }
export interface CreateApiSagaOpts {
  request: (...args: any[]) => any;
  take?: TakeStrategy;
  retries?: number;
  retryDelay?: number;
}
export interface CreateSagaSliceOpts {
  name: string;
  initialState?: AnyObject;
  reducers?: AnyObject;
  asyncActions?: AnyObject;
}
