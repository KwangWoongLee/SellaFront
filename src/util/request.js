import axios from 'axios';
import _ from 'lodash';
import Recoils from 'recoils';
import com, { modal, gzip_compress_crypt, gzip_uncompress_crypt, navigate } from 'util/com';

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

const request = {
  post: async (url, send_obj, common_err = true, ...headers) => {
    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);
    let send_data;
    try {
      send_data = {
        crypt: gzip_compress_crypt(JSON.stringify(send_obj)),
      };

      const client = get_client({ Authorization: com.storage.getItem('access_token') }, ...headers);
      const res = await client.post(`${url}`, send_data);
      ret.data = JSON.parse(gzip_uncompress_crypt(res.data.crypt));

      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        let refresh = false;
        if (e.response.status === 401) {
          refresh = true;
          const refresh_client = get_client({ Authorization: com.storage.getItem('refresh_token') }, ...headers);
          const res = await refresh_client.post(`/refresh`, {});

          const { data } = JSON.parse(gzip_uncompress_crypt(res.data.crypt));
          com.storage.setItem('access_token', data.access_token);
          if (data.refresh_expired) {
            com.storage.setItem('access_token', '');
            com.storage.setItem('refresh_token', '');

            Recoils.resetState('CONFIG:ACCOUNT');
            Recoils.resetState('ALERT');
            Recoils.resetState('CERT');
            Recoils.resetState('CONFIRM');

            modal.alert('세션정보가 만료되었습니다. 재로그인 해주세요.');

            navigate('/login');
          } else {
            try {
              const client = get_client({ Authorization: com.storage.getItem('access_token') }, ...headers);
              const res = await client.post(`${url}`, send_data);
              ret.data = JSON.parse(gzip_uncompress_crypt(res.data.crypt));

              if (res.data.err_msg) ret.err = res.data.err_msg;
            } catch (e) {
              if (e.response.data.crypt) {
                ret.err = JSON.parse(gzip_uncompress_crypt(e.response.data.crypt));
              } else {
                ret.err = '고객센터에 문의 해주세요.';
              }
              console.error('send : ', send_obj, 'error : ', e.response.data);
            }
          }
        }

        if (!refresh) {
          if (e.response.data.crypt) {
            ret.err = JSON.parse(gzip_uncompress_crypt(e.response.data.crypt));
          } else {
            ret.err = '고객센터에 문의 해주세요.';
          }
          console.error('send : ', send_obj, 'error : ', e.response.data);
        }
      } else {
        // 서버의 처리되지 않은 에러
        const error = { status: 500, error: '고객센터에 문의 해주세요.', error_no: -1 };
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) {
      if (ret.err && ret.err.error_no === -8) {
        com.storage.setItem('access_token', '');
        com.storage.setItem('refresh_token', '');

        Recoils.resetState('CONFIG:ACCOUNT');
        Recoils.resetState('ALERT');
        Recoils.resetState('CERT');
        Recoils.resetState('CONFIRM');

        modal.alert(ret.err.error);

        // 중복로그인 시 날리기
        navigate('/login');
      } else if (ret.err && ret.err.error_no === -14) {
        Recoils.resetState('ALERT');
        Recoils.resetState('CERT');
        Recoils.resetState('CONFIRM');

        modal.alert(ret.err.error);
        // 미결제 상태
        navigate('/mypage/membership');
      } else modal.alert(ret.err.error);
    }

    return ret;
  },
  post_form: async (url, formdata, common_err = true, ...headers) => {
    const ret = {
      err: null,
      data: null,
    };

    modal.spinner(true);
    try {
      const client = get_client({ Authorization: com.storage.getItem('access_token') }, ...headers);
      const res = await client.post(`${url}`, formdata);
      ret.data = JSON.parse(gzip_uncompress_crypt(res.data.crypt));

      if (res.data.err_msg) ret.err = res.data.err_msg;
    } catch (e) {
      if (e.response && e.response.data) {
        let refresh = false;
        if (e.response.status === 401) {
          refresh = true;
          const refresh_client = get_client({ Authorization: com.storage.getItem('refresh_token') }, ...headers);
          const res = await refresh_client.post(`/refresh`, {});

          const { data } = JSON.parse(gzip_uncompress_crypt(res.data.crypt));
          com.storage.setItem('access_token', data.access_token);
          if (data.refresh_expired) {
            com.storage.setItem('access_token', '');
            com.storage.setItem('refresh_token', '');

            Recoils.resetState('CONFIG:ACCOUNT');
            Recoils.resetState('ALERT');
            Recoils.resetState('CERT');
            Recoils.resetState('CONFIRM');

            modal.alert('세션정보가 만료되었습니다. 재로그인 해주세요.');

            navigate('/login');
          } else {
            try {
              const client = get_client({ Authorization: com.storage.getItem('access_token') }, ...headers);
              const res = await client.post(`${url}`, formdata);
              ret.data = JSON.parse(gzip_uncompress_crypt(res.data.crypt));

              if (res.data.err_msg) ret.err = res.data.err_msg;
            } catch (e) {
              if (e.response.data.crypt) {
                ret.err = JSON.parse(gzip_uncompress_crypt(e.response.data.crypt));
              } else {
                ret.err = '고객센터에 문의 해주세요.';
              }
            }
          }
        }

        if (!refresh) {
          if (e.response.data.crypt) {
            ret.err = JSON.parse(gzip_uncompress_crypt(e.response.data.crypt));
          } else {
            ret.err = '고객센터에 문의 해주세요.';
          }
        }
      } else {
        // 서버의 처리되지 않은 에러
        const error = { status: 500, error: '고객센터에 문의 해주세요.', error_no: -1 };
        ret.err = error;
      }
    } finally {
      modal.spinner(false);
    }

    if (ret.err && common_err) {
      if (ret.err && ret.err.error_no === -8) {
        com.storage.setItem('access_token', '');
        com.storage.setItem('refresh_token', '');

        Recoils.resetState('CONFIG:ACCOUNT');
        Recoils.resetState('ALERT');
        Recoils.resetState('CONFIRM');
        Recoils.resetState('CERT');

        modal.alert(ret.err.error);

        // 중복로그인 시 날리기
        navigate('/login');
      } else if (ret.err && ret.err.error_no === -14) {
        Recoils.resetState('ALERT');
        Recoils.resetState('CONFIRM');
        Recoils.resetState('CERT');

        modal.alert(ret.err.error);
        // 미결제 상태
        navigate('/mypage/membership');
      } else modal.alert(ret.err.error);
    }

    return ret;
  },
};

export default request;
