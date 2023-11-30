import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import com, { logger, navigate } from 'util/com';

import Recoils from 'recoils';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import 'styles/Login.scss';

const RegistResult = () => {
  const [id, setId] = useState('');
  useEffect(() => {
    const cert = Recoils.getState('CONFIG:CERT');
    setId(cert.temp_id);
  }, []);

  const onClick = () => {
    navigate('/login');
  };

  return (
    <>
      <Head_NoLogin />
      <Body title={`회원가입 완료`} myClass={'registresult'}>
        <div className="formbox">
          <h3>회원가입 완료</h3>

          <span>아래 ID로 고객님 계정이 생성되었습니다.</span>

          <p>{id}</p>

          <Button variant="primary" className="btn_blue" onClick={onClick}>
            로그인
          </Button>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(RegistResult);
