import React, { useReducer } from 'react';
import Recoils from 'recoils';
import _ from 'lodash';
import moment from 'moment';
import { navigate_ref } from 'components/common/NavigateCtr';
import dateFormat from 'dateformat';
import conf from '../config/auth.json';
import crypto from 'crypto';
const com = {};
com.storage = window.localStorage;
com.ref = {};

export const storage = null; // localStorage

export const ArrayToTableData = (data) =>
  data.map((tr, idx) => (
    <tr key={idx}>
      {tr.map((td, idx2) => (
        <td key={idx2}>{td}</td>
      ))}
    </tr>
  ));

export const modal = {
  login: () => {
    Recoils.setState('MODAL:LOGIN', true);
  },
  spinner: (visible) => {
    Recoils.setState('SPINEER', visible);
  },
  alert: (error) => {
    Recoils.setState('ALERT', { show: true, error });
  },
  confirm: (title, body, buttons) => {
    Recoils.setState('CONFIRM', { show: true, title, body, buttons: buttons });
  },
  file_upload: (url, accept, label, frm_data, cb = null, title = null, multiple = true) => {
    Recoils.setState('MODAL:FILEUPLOAD', { show: true, url, accept, label, frm_data, title, cb, multiple });
  },
};

export const logger = {
  level: {
    render: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
  },
  current_level: process.env.REACT_APP_LOGLEVEL,
  str_convert: (str) => (typeof str === 'object' ? JSON.stringify(str) : str),
  get_message: function (...arg) {
    if (arg.length === 1) return this.str_convert(arg[0]);
    const str = _.reduce(arg, (msg, s) => msg.concat(this.str_convert(s)), '');
    return str;
  },
  render: function (...arg) {
    if (process.env.NODE_ENV !== 'development') return;
    if (this.level[this.current_level] < this.level.render) return;

    const message = this.get_message(...arg);
    console.log('\x1b[35m%s\x1b[0m', `RENDER [${moment().format('YYYY-MM-DD HH:mm:ss')}] : ${message}`);
  },
  debug: function (...arg) {
    if (process.env.NODE_ENV !== 'development') return;
    if (this.level[this.current_level] < this.level.debug) return;

    const message = this.get_message(...arg);
    console.log('\x1b[34m%s\x1b[0m', `DEBUG [${moment().format('YYYY-MM-DD HH:mm:ss')}] : ${message}`);
  },

  info: function (...arg) {
    if (process.env.NODE_ENV !== 'development') return;
    if (this.level[this.current_level] < this.level.info) return;

    const message = this.get_message(...arg);
    console.log('\x1b[32m%s\x1b[0m', `INFO [${moment().format('YYYY-MM-DD HH:mm:ss')}] : ${message}`);
  },

  warn: function (...arg) {
    if (process.env.NODE_ENV !== 'development') return;
    if (this.level[this.current_level] < this.level.warn) return;

    const message = this.get_message(...arg);
    console.log('\x1b[33m%s\x1b[0m', `WARN [${moment().format('YYYY-MM-DD HH:mm:ss')}] : ${message}`);
  },

  error: function (...arg) {
    if (process.env.NODE_ENV !== 'development') return;
    if (this.level[this.current_level] < this.level.error) return;

    const message = this.get_message(...arg);
    console.log('\x1b[31m%s\x1b[0m', `ERROR [${moment().format('YYYY-MM-DD HH:mm:ss')}] : ${message}`);
  },
};

const input_reducer = (state, action) => ({
  ...state,
  [action.name]: action.value,
});

export const useInput = (init) => {
  const [state, dispatch] = useReducer(input_reducer, init);
  const onChange = (e) => {
    dispatch(e.target);
  };
  return [state, onChange, dispatch];
};

export const navigate = (path) => {
  const pathname = navigate_ref.current.location.pathname;

  //console.log('pathname : ', pathname, ', arg : ', path);
  if (pathname === path) {
    page_reload();
  } else {
    navigate_ref.current.navigate(path);
  }
  // navigate_ref.current.navigate(path);
};

export const page_reload = () => {
  const pathname = navigate_ref.current.location.pathname;
  navigate_ref.current.navigate('/empty');
  setTimeout(() => navigate_ref.current.navigate(pathname), 1);
};

export const is_authed = () => {
  const email = com.storage.getItem('email');
  const password = com.storage.getItem('password');
  const account = Recoils.getState('CONFIG:ACCOUNT');
  if (email && password && account.grade === -1) {
    return false;
  }
  return true;
};

export const boolType = (value) => {
  if (value === 'Y') return 1;
  else return 0;
};

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  let strTime = ampm + ' ' + hours + ':' + minutes + ':' + seconds;
  return strTime;
}

export const time_format = (time) => {
  const now = new Date(time);
  const strTime = formatAMPM(now);
  return dateFormat(now, `yyyy-mm-dd ${strTime}`);
};

export const get_login_hash = function (value) {
  const login_secret = conf.login_secret;
  const data = `${login_secret}${value}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
};

export default com;
