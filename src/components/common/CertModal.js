import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { img_src, logger, navigate, modal } from 'util/com';
import 'styles/Modal.scss';
import { RequestCert } from 'util/certification';

import icon_close from 'images/icon_close.svg';

const CertModal = () => {
  const [state, setState] = Recoils.useState('CERT');
  useEffect(() => {
    if (!state) {
      return;
    }

    let redirect_url = '';
    switch (state.mode) {
      case 0: {
        redirect_url = '/regist';
        break;
      }
      case 1: {
        redirect_url = '/search/id/result';
        break;
      }
      case 2: {
        redirect_url = '/search/password/result';
        break;
      }
    }

    RequestCert(redirect_url, (data) => {
      if (data) {
        const origin_cert = Recoils.getState('CONFIG:CERT');
        Recoils.setState('CONFIG:CERT', {
          ...origin_cert,
          ...data,
        });

        navigate(redirect_url);
      } else modal.alert('인증에 실패하였습니다.');
    });
  }, [state]);

  return <></>;
};

export default React.memo(CertModal);
