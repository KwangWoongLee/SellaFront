import { modal } from './com';

const payment = {};

export const RequestPay = (data, cb) => {
  const PG_CODE = 'nice';
  const PG_MID = 'iamport00m';
  if (!data || !cb) {
    modal.alert('잘못된 요청입니다.');
    return;
  }

  window.IMP.request_pay(
    {
      pg: `${PG_CODE}.${PG_MID}`,
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: data.name,
      amount: data.price, // 필수
      buyer_tel: data.buyer_tel, // 필수
      vbank_due: '2024-10-28', // 필수
      escrow: false, // 필수
      // period: [20231027, 20231028], // 필수
    },
    (rsp) => {
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

export const RequestPayPeriod = (data, cb) => {
  const PG_CODE = 'nice_v2';
  const PG_MID = 'iamport01m';

  if (!data || !cb) {
    modal.alert('잘못된 요청입니다.');
    return;
  }

  window.IMP.request_pay(
    {
      pg: `${PG_CODE}.${PG_MID}`,
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: data.name,
      amount: data.price, // 필수
      buyer_tel: data.buyer_tel, // 필수
      vbank_due: '2024-10-28', // 필수
      escrow: false, // 필수
      // period: [20231027, 20231028], // 필수
    },
    (rsp) => {
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
