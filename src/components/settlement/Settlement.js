import React, { useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Recoils from 'recoils';
import _ from 'lodash';

import 'styles/Settlement.scss';

import { logger } from 'util/com';

const Settlement = () => {
  logger.render('Settlement');
  const account = Recoils.useValue('CONFIG:ACCOUNT');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`Settlement`}>
        <SettlementNavTab active="" />
        <div className="page">0</div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Settlement);
