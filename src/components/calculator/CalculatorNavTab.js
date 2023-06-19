import React, { useEffect } from 'react';
import {} from 'react-bootstrap';
import { logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const data = [
  { name: '/calculator/margin', desc: '마진 계산기' },
  { name: '/calculator/buying', desc: '사입 계산기' },
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
