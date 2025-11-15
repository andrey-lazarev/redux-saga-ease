# redux-saga-ease

A lightweight helper library that simplifies working with **Redux-Saga** by introducing an intuitive abstraction similar to Redux Toolkit slices.

This library helps you:

* Reduce saga boilerplate
* Keep actions, reducers, and sagas in one place
* Create saga-powered async flows with minimal code
* Improve maintainability and readability of Redux codebases

## Features

* `createSagaSlice()` — define actions, reducers, and sagas together
* Simple async flows: `request → success → failure`
* Built-in saga runners (`takeLatest` or `takeEvery`)
* Works with Redux Toolkit or classic Redux
* Compatible with Next.js SSR

---

# Quick Start

### 1. Create a saga slice

```ts
import { createSagaSlice } from "redux-saga-ease";
import { call } from "redux-saga/effects";
import api from "../api";

export const userSlice = createSagaSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: (slice) => ({
    fetchUserRequest: (state) => { state.loading = true; },
    fetchUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    fetchUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }),
  sagas: (slice) => ({
    *fetchUserRequestSaga(action) {
      try {
        const user = yield call(api.fetchUser, action.payload);
        yield slice.put.fetchUserSuccess(user);
      } catch (err) {
        yield slice.put.fetchUserFailure(err.message);
      }
    }
  }),
  sagaTake: "takeLatest", // or "takeEvery"
});
```

---

# Add to your Redux store

```ts
import createSagaMiddleware from "redux-saga";
import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./userSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
  middleware: (getDefault) => getDefault().concat(sagaMiddleware),
});

sagaMiddleware.run(userSlice.rootSaga);
```

---

# Usage in components

```tsx
import { useDispatch, useSelector } from "react-redux";
import { userSlice } from "../store/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  return (
    <div>
      <button onClick={() => dispatch(userSlice.actions.fetchUserRequest())}>
        Load User
      </button>
      {JSON.stringify(user)}
    </div>
  );
}
```

---

# API Reference

## `createSagaSlice(options)`

Creates a slice with reducers + sagas.

### Options:

```ts
{
  name: string;
  initialState: object;
  reducers: (slice) => ReducerMap;
  sagas: (slice) => SagaMap;
  sagaTake?: "takeEvery" | "takeLatest";
}
```

### Generated structure:

```ts
slice = {
  name,
  reducer,
  actions,
  put: boundActionCreators,
  sagas,
  rootSaga,
}
```
