import React, { useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { navigate, logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const data = [
  { name: '/settlement/tab1', desc: '손익 계산' },
  { name: '/settlement/tab2', desc: '오늘 주문 합계' },
];
const SettlementNavTab = ({ active }) => {
  logger.render('CSCenterNavTab');

  useEffect(() => {}, []);

  return (
    <>
      <CommonNavTab data={data} active={active}></CommonNavTab>
    </>
  );
};

export default React.memo(SettlementNavTab);
