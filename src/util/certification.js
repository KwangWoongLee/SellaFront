import { modal } from './com';
import request from 'util/request';

const certification = {};

export const RequestCert = (redirect_url, cb) => {
  const PG_CODE = 'danal_tpay';
  const PG_MID = 'B010008345';
  if (!cb) {
    modal.alert('잘못된 요청입니다.');
    return;
  }

  window.IMP.certification(
    {
      pg: `${PG_CODE}.${PG_MID}`,
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,

      m_redirect_url: redirect_url,
      popup: false,
    },
    (rsp) => {
      if (rsp.success) {
        request.post('base/certificate', { imp_uid: rsp.imp_uid }).then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            cb(data);
          }
        });
      }
    }
  );
};

export default certification;
