import React, { useState, useEffect } from 'react';

import { Button, Card, ListGroup } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CalculatorNavTab from 'components/calculator/CalculatorNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';
const Margin = () => {
  logger.render('Margin');

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
        <CalculatorNavTab active="/calculator/margin" />
        <div className="margin">
          <div className="">
            <Button variant="primary" onClick={onDelete}>
              초기화
            </Button>
            <Button variant="primary" onClick={onDelete}>
              저장
            </Button>
            <Card border="primary" style={{ width: '18rem' }}>
              <ListGroup variant="flush">
                <ListGroup.Item>Cras justo odio</ListGroup.Item>
                <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
              </ListGroup>
            </Card>
          </div>
          <div>
            <Button variant="primary" onClick={onDelete}>
              선택 삭제
            </Button>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Margin);
