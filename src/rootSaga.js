import { drizzleSagas } from 'drizzle';
import { map } from 'ramda';
import { all, fork } from 'redux-saga/effects';




export default function* root() {
  yield all(map(fork));
  yield all(
    drizzleSagas.map(saga => fork(saga))
  )



}
