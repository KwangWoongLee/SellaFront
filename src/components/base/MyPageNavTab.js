import React, { useEffect } from 'react';
import {} from 'react-bootstrap';
import { logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const data = [
  //{ name: '/mypage/membership', desc: '고객님께선 현재 [유료서비스]를 이용 중이십니다.' },
  { name: '/mypage/membership', desc: '고객님께선 현재 [무료서비스]를 이용 중이십니다.' },
  //{ name: '/mypage/profile', desc: '회원정보관리' },
];
const CalculatorNavTab = ({ active }) => {
  logger.render('CalculatorNavTab');

  useEffect(() => {}, []);

  return (
    <>
      <CommonNavTab data={data} active={active}></CommonNavTab>
    </>
  );
};

export default React.memo(CalculatorNavTab);
