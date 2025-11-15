import {
  all,
  fork,
  takeEvery,
  takeLatest,
  put,
  cancelled,
} from "redux-saga/effects";
import { UnknownAction } from "redux";
import { CreateSagaSliceOpts } from "./types";

export function createSagaSlice(options: CreateSagaSliceOpts) {
  const { name, initialState = {}, reducers = {}, asyncActions = {} } = options;

  // Generate action types for async actions
  const actionTypes: Record<string, any> = {};
  for (const key of Object.keys(asyncActions)) {
    const base = `${name}/${key}`;
    actionTypes[key] = {
      REQUEST: `${base}/request`,
      SUCCESS: `${base}/success`,
      FAILURE: `${base}/failure`,
    };
  }

  // Generate action creators for reducers and async actions
  const actions: Record<string, any> = {};

  for (const key of Object.keys(reducers)) {
    actions[key] = (payload?: any) => ({ type: `${name}/${key}`, payload });
  }

  for (const key of Object.keys(asyncActions)) {
    actions[key] = (payload?: any) => ({
      type: actionTypes[key].REQUEST,
      payload,
    });
    actions[`${key}Success`] = (payload?: any) => ({
      type: actionTypes[key].SUCCESS,
      payload,
    });
    actions[`${key}Failure`] = (payload?: any) => ({
      type: actionTypes[key].FAILURE,
      payload,
    });
  }

  // Reducer handling both sync and async actions
  function reducer(state = initialState, action: UnknownAction) {
    const shortType = action.type.startsWith(`${name}/`)
      ? action.type.slice(name.length + 1)
      : null;

    // Sync reducers
    if (shortType && reducers[shortType]) {
      reducers[shortType](state, action);
      return state;
    }

    // Async reducers
    for (const key of Object.keys(asyncActions)) {
      const { REQUEST, SUCCESS, FAILURE } = actionTypes[key];
      const cfg = asyncActions[key];

      switch (action.type) {
        case REQUEST:
          return {
            ...state,
            loading: { ...state.loading, [key]: true },
            error: { ...state.error, [key]: null },
          };
        case SUCCESS:
          if (cfg.onSuccess) {
            cfg.onSuccess(state, action.payload);
            return state;
          }
          return {
            ...state,
            loading: { ...state.loading, [key]: false },
            data: { ...state.data, [key]: action.payload },
          };
        case FAILURE:
          if (cfg.onError) {
            cfg.onError(state, action.payload);
            return state;
          }
          return {
            ...state,
            loading: { ...state.loading, [key]: false },
            error: { ...state.error, [key]: action.payload },
          };
      }
    }

    return state;
  }

  // Root saga combining all async action workers
  function* rootSaga() {
    const sagas = Object.keys(asyncActions).map((key) => {
      const cfg = asyncActions[key];
      const types = actionTypes[key];

      function* worker(action: UnknownAction) {
        try {
          const res = yield* cfg.worker(action);
          yield put({ type: types.SUCCESS, payload: res });
        } catch (err) {
          yield put({ type: types.FAILURE, payload: err });
        } finally {
          if (yield cancelled()) {
            // optional cleanup
          }
        }
      };

      const takeEffect = cfg.take === "takeEvery" ? takeEvery : takeLatest;
      return fork(function* () {
        yield takeEffect(types.REQUEST, worker);
      });
    });

    yield all(sagas);
  }

  return { name, actions, reducer, saga: rootSaga };
}
