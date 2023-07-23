import axios from 'axios';
import _ from 'lodash';
import com, { modal } from 'util/com';

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
    baseURL: '/api/v1',
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
const api_version = 'v1';

const request = {
  post: async (url, send_obj, common_err = true, ...headers) => {
    // const input_err = input_chk(send_obj);
    // if (input_err) {
    //   if (common_err) modal.alert('error', '입력값에러', input_err.err);
    //   return input_err;
    // }

    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);
    try {
      const client = get_client({ Authorization: com.storage.token }, ...headers);
      const res = await client.post(`${url}`, send_obj);
      ret.data = res.data;
      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        ret.err = e.response.data;
        console.error('send : ', send_obj, 'error : ', e.response.data);
      } else {
        // 서버의 처리되지 않은 에러
        const error = { status: 500, error: '고객센터에 문의 해주세요.', error_no: -1 };
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) modal.alert(ret.err.error);

    return ret;
  },
  post_form: async (url, formdata, common_err = true, ...headers) => {
    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);

    try {
      const client = get_client({ Authorization: com.storage.token }, ...headers);
      const res = await client.post(`${url}`, formdata);
      ret.data = res.data;
      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        ret.err = e.response.data;
        console.error('send : form_data', 'error : ', e.response.data);
      } else {
        // 서버의 처리되지 않은 에러
        const error = { status: 500, error: '고객센터에 문의 해주세요.', error_no: -1 };
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) modal.alert(ret.err.error);

    return ret;
  },
};

export default request;
