import React, { useEffect } from 'react';
import {} from 'react-bootstrap';
import { logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const CalculatorNavTab = ({ active, gradeData }) => {
  logger.render('CalculatorNavTab');

  const data = [
    {
      name: '/mypage/membership',
      desc: `고객님께선 현재 [${gradeData && gradeData.grade == 0 ? '무료' : '유료'}서비스]를 이용 중이십니다.`,
    },
  ];

  useEffect(() => {}, []);

  return (
    <>
      <CommonNavTab data={data} active={active}></CommonNavTab>
    </>
  );
};

export default React.memo(CalculatorNavTab);
