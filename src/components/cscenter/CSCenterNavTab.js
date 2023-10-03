import React, { useEffect } from 'react';
import { logger } from 'util/com';
import CommonNavTab from 'components/common/CommonNavTab';

const data = [
  { name: '/CSCenter', desc: '고객센터' },
  { name: '/cscenter/announcement', desc: '공지사항' },
  { name: '/cscenter/faq', desc: '자주 묻는 질문(FAQ)' },
  { name: '/cscenter/manual', desc: '사용방법' },
];
const CSCenterNavTab = ({ active }) => {
  logger.render('CSCenterNavTab');

  useEffect(() => {}, []);

  return (
    <>
      <CommonNavTab data={data} active={active}></CommonNavTab>
    </>
  );
};

export default React.memo(CSCenterNavTab);
