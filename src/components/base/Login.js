import React, { useEffect, useState } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, modal } from 'util/com';
import request from 'util/request';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';
import _ from 'lodash';

import 'styles/Login.scss';

const Login = () => {
  logger.render('Login');
  const [idSaveChecked, setIdSaveChecked] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const idSave = com.storage.getItem('idSave');
    if (idSave === 'true') {
      setIdSaveChecked(true);
      setEmail(com.storage.getItem('email') !== 'undefined' ? com.storage.getItem('email') : '');
    } else {
      setIdSaveChecked(false);
      com.storage.setItem('email', 'undefined');
      setEmail('');
    }

    const tempRegistResult = _.cloneDeep(com.storage.getItem('tempRegistResult'));
    const tempSearchIdResult = _.cloneDeep(com.storage.getItem('tempSearchIdResult'));

    if (tempRegistResult) {
      setEmail(tempRegistResult);
      com.storage.setItem('tempRegistResult', '');
      return;
    } else if (tempSearchIdResult) {
      setEmail(tempSearchIdResult);
      com.storage.setItem('tempSearchIdResult', '');
      return;
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const email = e.currentTarget[0].value;
    const password = e.currentTarget[1].value;

    if (!email || !password) {
      modal.alert(`아이디 또는 비밀번호를 잘못 입력했습니다.
      입력하신 내용을 다시 확인해주세요.`);
      return;
    }

    request.post('login', { email, password }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;

        Recoils.setState('CONFIG:ACCOUNT', {
          email: email,
          grade: data.grade,
          name: data.name,
          access_token: data.access_token,
        });

        if (idSaveChecked) {
          com.storage.setItem('idSave', true);
          com.storage.setItem('email', email);
        } else {
          com.storage.setItem('idSave', false);
          com.storage.setItem('email', '');
        }

        com.storage.setItem('access_token', data.access_token);
        com.storage.setItem('refresh_token', data.refresh_token);

        Recoils.setState('DATA:GOODS', data.goods);
        Recoils.setState('DATA:PLATFORMS', data.forms);
        Recoils.setState('DATA:FORMSMATCH', data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', data.goods_match);
        Recoils.setState('SELLA:PLATFORM', data.platform);
        Recoils.setState('SELLA:SELLAFORMS', data.sella_forms);
        Recoils.setState('SELLA:CATEGORIES', data.sella_categories);
        Recoils.setState('SELLA:BASICFORMS', data.sella_basic_forms);
        Recoils.setState('SELLA:GRADE', data.sella_grade);

        navigate('/settlement/margin_calc');
      }
    });

    logger.info(`login : email = ${email}`);
  };

  const checkedItemHandler = (d) => {
    setIdSaveChecked(d);
  };

  return (
    <>
      <Head />
      <Body title={`로그인`} myClass={'login'}>
        <iframe
          width="653"
          height="367"
          src="https://www.youtube.com/embed/DfSuw44goMM"
          title="유튜브 쇼핑몰 채널 따라해서 연 매출 25억 달성한 사장님의 성공 스토리"
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
              defaultValue={email}
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <label>비밀번호</label>
            <Form.Control
              type="password"
              placeholder="비밀번호"
              aria-label="password"
              defaultValue={''}
              aria-describedby="basic-addon2"
            />
          </InputGroup>
          <div className="btnbox">
            <div className="btnbox_left">
              <Checkbox checked={idSaveChecked} checkedItemHandler={checkedItemHandler}></Checkbox>
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
