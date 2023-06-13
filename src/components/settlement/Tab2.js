import React, { useState, useEffect } from 'react';

import { Table, Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { useInput, modal } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import 'styles/User.scss';

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
