import React, { useState, useEffect, useRef } from 'react';

import { Button, InputGroup, Form, Modal } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import Checkbox from 'components/common/CheckBoxCell';
import { logger, modal, navigate } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import { useScript } from 'components/common/LoadScript';
import 'styles/Mypage.scss';

const Payment = () => {
  logger.render('Payment');

  const status = useScript('https://cdn.iamport.kr/v1/iamport.js');
  useEffect(() => {
    if (status === 'ready') {
      window.IMP.init('a');
    }
  });

  return <>123{/* <script src=""></script> */}</>;
};

export default React.memo(Payment);
