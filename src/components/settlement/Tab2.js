import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import { logger } from 'util/com';

const Tab2 = () => {
  logger.render('Tab2');

  const [info, setInfo] = useState(null);

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`유저 기본정보`}>
        <SettlementNavTab active="/settlement/Tab2" />
        <div className="Tab2"></div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Tab2);
