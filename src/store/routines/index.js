import { createRoutine, bindRoutineToReduxForm } from 'redux-saga-routines';

export const submitFormRoutine = createRoutine('SUBMIT_MY_FORM');
export const submitFormHandler = bindRoutineToReduxForm(submitFormRoutine);
