import React, { useState, useEffect } from 'react';

import { Table, Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { useInput, modal, navigate } from 'util/com';
import request from 'util/request';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';

const Inquiry = () => {
  //logger.debug('Inquiry');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={``}>
        <CSCenterNavTab active="/cscenter/inquiry" />
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Inquiry);
