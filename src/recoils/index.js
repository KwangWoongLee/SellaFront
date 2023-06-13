import _ from 'lodash';
import states from 'recoils/atoms';
import { useRecoilState, useSetRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { getRecoil, setRecoil, resetRecoil } from 'recoil-nexus';

// coustume hooks
const Recoils = {
  useState: (key) => useRecoilState(get_state(key)),
  useSetState: (key) => useSetRecoilState(get_state(key)),
  useValue: (key) => useRecoilValue(get_state(key)),
  useResetState: (key) => useResetRecoilState(get_state(key)),
  getState: (key) => getRecoil(get_state(key)),
  setState: (key, next) => setRecoil(get_state(key), next),
  resetState: (key) => resetRecoil(get_state(key)),
};

const get_state = (key) => _.find(states, { key });

export default Recoils;
