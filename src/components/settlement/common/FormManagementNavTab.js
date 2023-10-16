import React, { useEffect } from 'react';
import {} from 'react-bootstrap';
import { logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const data = [
  { name: '/settlement/sale_product', desc: '판매상품 연결 조회' },
  { name: '/settlement/standard_product', desc: '기준상품 연결 조회' },
  { name: '/settlement/form_management', desc: '매체별 양식 관리' },
];
const SettlementNavTab = ({ active }) => {
  logger.render('SettlementNavTab');

  useEffect(() => {}, []);

  return (
    <>
      <CommonNavTab data={data} active={active}></CommonNavTab>
    </>
  );
};

export default React.memo(SettlementNavTab);
