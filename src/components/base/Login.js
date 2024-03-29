import React, { useEffect, useState } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, modal } from 'util/com';
import request from 'util/request';

import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';
import _ from 'lodash';
import { RequestCert } from 'util/certification';

import 'styles/Login.scss';

const Login = () => {
  const [idSaveChecked, setIdSaveChecked] = useState(false);
  const [id, setID] = useState('');

  useEffect(() => {
    const idSave = com.storage.getItem('idSave');
    if (idSave === 'true') {
      setIdSaveChecked(true);
      setID(com.storage.getItem('id') !== 'undefined' ? com.storage.getItem('id') : '');
    } else {
      setIdSaveChecked(false);
      com.storage.setItem('id', 'undefined');
      setID('');
    }

    const tempRegistResult = _.cloneDeep(com.storage.getItem('tempRegistResult'));
    const tempSearchIdResult = _.cloneDeep(com.storage.getItem('tempSearchIdResult'));

    if (tempRegistResult) {
      setID(tempRegistResult);
      com.storage.setItem('tempRegistResult', '');
      return;
    } else if (tempSearchIdResult) {
      setID(tempSearchIdResult);
      com.storage.setItem('tempSearchIdResult', '');
      return;
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const id = e.currentTarget[0].value;
    const password = e.currentTarget[1].value;

    if (!id || !password) {
      modal.alert(`아이디 또는 비밀번호를 잘못 입력했습니다.
      입력하신 내용을 다시 확인해주세요.`);
      return;
    }

    request.post('login', { id, password }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;

        Recoils.setState('CONFIG:ACCOUNT', {
          id: id,
          grade: data.grade,
          name: data.name,
          access_token: data.access_token,
        });

        if (idSaveChecked) {
          com.storage.setItem('idSave', true);
          com.storage.setItem('id', id);
        } else {
          com.storage.setItem('idSave', false);
          com.storage.setItem('id', '');
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

        navigate('/');
      }
    });

    logger.info(`login : id = ${id}`);
  };

  const checkedItemHandler = (d) => {
    setIdSaveChecked(d);
  };

  return (
    <>
      <Head_NoLogin />
      <Body title={`로그인`} myClass={'login'}>
        <iframe
          width="653"
          height="367"
          src="https://www.youtube.com/embed/HvdYBtUrMhw?si=S_fwdSb7DiO_8-9c"
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
              placeholder="아이디"
              aria-label="id"
              defaultValue={id}
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
              const redirect_url = '/regist';
              navigate(redirect_url);
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
