import React from 'react';
import {atom} from 'recoil'

export const dataState = atom({
  key: 'dataState', // unique ID (with respect to other atoms/selectors)
  default: [] as Object[], // default value (aka initial value)
});

export const viewData = atom({
  key: 'viewDataState', // unique ID (with respect to other atoms/selectors)
  default: {}, // default value (aka initial value)
});

export const convertedData = atom({
  key: 'convertedDataState', // unique ID (with respect to other atoms/selectors)
  default: [] as IDataReps, // default value (aka initial value)
});

export const RefContext = React.createContext({})