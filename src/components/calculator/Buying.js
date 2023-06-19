import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CalculatorNavTab from 'components/calculator/CalculatorNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';
const Buying = () => {
  logger.render('Buying');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;
  const [datas, setDatas] = useState([]);

  useEffect(() => {
    // request.post(`user/delivery`, { aidx }).then((ret) => {
    //   if (!ret.err) {
    //     logger.info(ret.data);
    //     if (ret.data.length == 0) setView(false);
    //     else {
    //       setView(true);
    //     }
    //   }
    // });
  }, []);

  const onDelete = () => {};
  return (
    <>
      <Head />
      <Body title={`마진 계산기`}>
        <CalculatorNavTab active="/calculator/buying" />
        <div className="Buying">
          <Button variant="primary" onClick={onDelete}>
            선택 삭제
          </Button>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Buying);
