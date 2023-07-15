import React, { useEffect } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate } from 'util/com';
import { AiFillMail, AiFillLock } from 'react-icons/ai';
import request from 'util/request';
// import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

const Login = () => {
  logger.render('Login');

  useEffect(() => {}, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const id = e.currentTarget[0].value;
    const password = e.currentTarget[1].value;

    com.storage.setItem('id', id);
    com.storage.setItem('password', password);

    request.post('login', { id, password }).then((ret) => {
      if (!ret.err) {
        Recoils.setState('CONFIG:ACCOUNT', {
          id: ret.data.id,
          aidx: ret.data.aidx,
          grade: ret.data.grade,
          name: ret.data.name,
        });

        navigate('/');
      } else {
      }
    });

    logger.info(`submit : id = ${id}, password = ${password}`);
  };

  return (
    <>
      <Head />
      <Body title={`비밀번호 찾기 성공`} myClass={'searchresult'}>
        <Form onSubmit={onSubmit} id="login-modal-form" className="formbox">
          <h3>비밀번호 찾기</h3>

          <span>안전한 비밀번호로 변경해주세요.</span>

          <InputGroup className="inputid">
            <label>새 비밀번호</label>
            <Form.Control type="password" placeholder="새 비밀번호" defaultValue={''} />
          </InputGroup>

          <InputGroup className="inputname">
            <label>새 비밀번호 확인</label>
            <Form.Control type="password" placeholder="새 비밀번호 확인" defaultValue={''} />
          </InputGroup>

          <span className="inform">인증번호를 발송했습니다.</span>

          <div className="btnbox">
            <Button
              variant="primary"
              onClick={() => {
                navigate('/search/password');
              }}
            >
              비밀번호 찾기
            </Button>
            <Button
              variant="primary"
              className="btn_blue"
              onClick={() => {
                navigate('/login');
              }}
            >
              로그인
            </Button>
          </div>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Login);
