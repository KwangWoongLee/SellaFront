import React, { useEffect } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate } from 'util/com';
import request from 'util/request';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import 'styles/Login.scss';

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

        Recoils.setState('DATA:GOODS', ret.data.goods);
        Recoils.setState('DATA:PLATFORMS', ret.data.forms);
        Recoils.setState('DATA:FORMSMATCH', ret.data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', ret.data.goods_match);
        Recoils.setState('SELLA:PLATFORM', ret.data.platform);
        Recoils.setState('SELLA:SELLAFORMS', ret.data.sella_forms);
        Recoils.setState('SELLA:CATEGORIES', ret.data.sella_categories);

        navigate('/settlement/margin_calc');
      }
    });

    logger.info(`submit : id = ${id}, password = ${password}`);
  };

  return (
    <>
      <Head />
      <Body title={`로그인`} myClass={'login'}>
        <iframe
          width="653"
          height="367"
          src="https://www.youtube.com/embed/nLjVRnO1R2c"
          title="쿠팡 광고수익률 2,131%.. 죄송합니다.. 쿠팡 광고 찢어버렸네요.."
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          className="videobox"
        ></iframe>
        <Form onSubmit={onSubmit} id="login-modal-form" className="formbox">
          <h3>로그인</h3>
          <InputGroup className="mb-3">
            <label>아이디</label>
            <Form.Control
              type="text"
              placeholder="이메일 주소"
              aria-label="id"
              defaultValue={com.storage.getItem('id')}
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <label>비밀번호</label>
            <Form.Control
              type="password"
              placeholder="비밀번호"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
          </InputGroup>
          <div className="btnbox">
            <div className="btnbox_left">
              <input type={'checkbox'}></input>
              <label>ID 저장</label>
            </div>
            <div className="btnbox_right">
              <Nav.Link
                className="btn_txt"
                onClick={() => {
                  navigate('/search/id');
                }}
              >
                아이디 찾기
              </Nav.Link>
              <span> · </span>
              <Nav.Link
                className="btn_txt"
                onClick={() => {
                  navigate('/search/password');
                }}
              >
                비밀번호 찾기
              </Nav.Link>
            </div>
          </div>
          <Button variant="primary" type="submit" form="login-modal-form" className="btn_blue btn_login">
            로그인
          </Button>
          <Nav.Link
            className="btn_txt btn_join"
            onClick={() => {
              navigate('/regist');
            }}
          >
            회원가입
          </Nav.Link>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Login);
