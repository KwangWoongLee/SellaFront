import { modal } from './com';
import dateFormat from 'dateformat';

const payment = {};

export const RequestPay = (data, cb) => {
  const PG_CODE = 'nice';
  const PG_MID = 'iamport00m';
  if (!data || !cb) {
    modal.alert('잘못된 요청입니다.');
    return;
  }
  const remain_warranty_day = data.remain_warranty_day;
  const now = new Date(Date.now());
  const expire_date = now.getDate() + remain_warranty_day;

  const start_date = new Date(Date.now());
  start_date.setDate(expire_date + 1);
  const end_date = new Date(Date.now());
  end_date.setDate(expire_date + data.warranty_day);

  const start_date_format = Number(`${dateFormat(start_date, 'yyyymmdd')}`);
  const end_date_format = Number(`${dateFormat(end_date, 'yyyymmdd')}`);

  window.IMP.request_pay(
    {
      pg: `${PG_CODE}.${PG_MID}`,
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: data.name,
      amount: data.price, // 필수
      buyer_tel: data.buyer_tel, // 필수
      escrow: false, // 필수
      period: [start_date_format, end_date_format], // 필수
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
