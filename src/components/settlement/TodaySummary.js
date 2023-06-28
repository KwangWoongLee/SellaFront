import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';

import { logger } from 'util/com';

import 'styles/TodaySummary.scss';

const TodaySummary = () => {
  logger.render('TodaySummary');

  const [info, setInfo] = useState(null);

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`유저 기본정보`} myClass={'today_summary'}>
        <SettlementNavTab active="/settlement/today_summary" />
        <div></div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(TodaySummary);
