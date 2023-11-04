import { modal } from './com';

const payment = {};

export const RequestCertification = (data, cb) => {
  const PG_CODE = 'danal_tpay';
  const PG_MID = 'iamport01m';

  if (!data || !cb) {
    modal.alert('잘못된 요청입니다.');
    return;
  }

  window.IMP.certification(
    {
      pg: `${PG_CODE}.${PG_MID}`,
      merchant_uid: `mid_${new Date().getTime()}`,
      min_age: 14,
      company: 'SELLA',
    },
    (rsp) => {
      console.log('');
      // request.post('base/payment', { access_token: data.account.access_token, grade: d }).then((ret) => {
      //   if (!ret.err) {
      //     // modal.alert('결제가 완료되었습니다. 다시 로그인 해주세요.');
      //     // Recoils.resetState('CONFIG:ACCOUNT');
      //     // navigate('/');
      //   }
      // });
    }
  );
};

export default payment;
