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

import 'styles/Login.scss';

const SearchIDResult = () => {
  logger.render('SearchIDResult');

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
      } else {
      }
    });

    logger.info(`submit : id = ${id}, password = ${password}`);
  };

  return (
    <>
      <Head />
      <Body title={`아이디찾기 성공`} myClass={'registresult'}>
        <Form onSubmit={onSubmit} id="login-modal-form" className="formbox">
          <h3>아이디 찾기</h3>

          <span>고객님 정보와 일치하는 아이디입니다.</span>

          <p>test0001@gmail.com</p>

          <Button
            variant="primary"
            className=""
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
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SearchIDResult);
