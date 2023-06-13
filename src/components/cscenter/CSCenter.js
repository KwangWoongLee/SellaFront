import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import request from 'util/request';
import { modal } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
// import 'styles/CSCenter.scss';

import { logger } from 'util/com';

const CSCenter = () => {
  logger.render('CSCenter');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`CSCenter`}>
        <CSCenterNavTab active="" />
        <div className="page">고객센터</div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(CSCenter);
