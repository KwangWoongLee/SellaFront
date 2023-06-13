import axios from 'axios';
import _ from 'lodash';
import { modal, navigate } from 'util/com';
import Recoils from 'recoils';

const get_client = (...arg) => {
  let headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  for (const header of arg) {
    if (Object.keys(header).length) {
      const key = Object.keys(header)[0];
      if (header[key]) {
        headers = _.merge(headers, header);
      }
    }
  }

  return axios.create({
    headers,
    baseURL: '',
  });
};

const get_file_client = (...arg) => {
  let headers = {
    'Content-Type': 'multipart/form-data',
  };

  for (const header of arg) {
    if (Object.keys(header).length) {
      const key = Object.keys(header)[0];
      if (header[key]) {
        headers = _.merge(headers, header);
      }
    }
  }

  return axios.create({
    headers,
    baseURL: '',
  });
};

const input_chk = (send_obj) => {
  let err = null;
  _.forEach(send_obj, (v, k) => {
    if (!v || v.length === 0) {
      err = {
        err: `${k} : 입력값이 비었습니다.`,
      };
      return false;
    }
  });

  return err;
};

const request = {
  post: async (url, send_obj, common_err = true, ...headers) => {
    const input_err = input_chk(send_obj);
    if (input_err) {
      if (common_err) modal.alert('error', '입력값에러', input_err.err);
      return input_err;
    }

    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);

    try {
      const client = get_client(...headers);
      const res = await client.post(`/${url}`, send_obj);
      ret.data = res.data;
      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        ret.err = e.response.data;
        console.error('send : ', send_obj, 'error : ', e.response.data);
      } else {
        const error = e.message ? e.message : '알수 없는 에러';
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) modal.alert('error', '네트워크에러', ret.err);

    return ret;
  },
  post_form: async (url, formdata, common_err = true, ...headers) => {
    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);

    try {
      const client = get_file_client(...headers);
      const res = await client.post(`/${url}`, formdata);
      ret.data = res.data;
      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        ret.err = e.response.data;
        console.error('send : form_data , error : ', e.response.data);
      } else {
        const error = e.message ? e.message : '알수 없는 에러';
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) modal.alert('error', '네트워크에러', ret.err);

    return ret;
  },
};

export default request;
