import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import UserNavTab from 'components/settlement/SettlementNavTab';
import request from 'util/request';
import { modal } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import icon_add from 'images/icon_add.svg';
import icon_del from 'images/icon_del.svg';

import 'styles/Settlement.scss';

import { logger } from 'util/com';

const Settlement = () => {
  logger.render('Settlement');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  useEffect(() => {}, []);

  const onChange = (type, e) => {};

  const onClickAdd = (type, e) => {};

  const onDelete = (type, e) => {};

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
