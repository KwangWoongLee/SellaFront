import React, { useState, useEffect } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/SettlementNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;
  const [viewState, setView] = useState(true);
  const [platform, setPlatform] = useState('네이버 스마트스토어');

  useEffect(() => {
    request.post(`user/delivery`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        if (ret.data.length <= 1) setView(false);
        else {
          setView(true);
        }
      }
    });

    request.post(`user/packing`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        if (ret.data.length <= 1) setView(false);
        else {
          setView(true);
        }
      }
    });
  }, []);

  const onUpload = function () {
    modal.file_upload('settlement/profit_loss', '.xlsx', '파일 업로드', { aidx, platform }, (ret) => {
      if (!ret.err) {
        logger.info(ret.data);
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`손익 계산`}>
        <SettlementNavTab active="/settlement/margin_calc" />
        {viewState ? (
          <div className="MarginCalc">
            {platform}
            <Button variant="primary" onClick={onUpload}>
              새 주문서 업로드
            </Button>
          </div>
        ) : (
          <Modal show={!viewState} centered className="Confirm">
            {<Modal.Title className="text-primary">{'초기 값을 설정해 주세요.'}</Modal.Title>}
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step1');
              }}
            >
              확인
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step2');
              }}
            >
              취소
            </Button>
          </Modal>
        )}
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(MarginCalc);
