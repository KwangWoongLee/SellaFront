import React, { useEffect } from 'react';
import { Modal, Button, InputGroup, Form } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, modal, navigate } from 'util/com';
import { AiFillMail, AiFillLock } from 'react-icons/ai';
import request from 'util/request';
// import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

const Regist = () => {
  logger.render('Regist');

  useEffect(() => {}, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const id = e.currentTarget[0].value;
    const password = e.currentTarget[1].value;

    com.storage.setItem('id', id);
    com.storage.setItem('password', password);

    request.post('regist', { id, password }).then((ret) => {
      if (!ret.err) {
        navigate('/regist/result');
      } else {
      }
    });

    logger.info(`submit : id = ${id}, password = ${password}`);
  };

  return (
    <>
      <Head />
      <Body title={`회원가입`}>
        <Form onSubmit={onSubmit} id="regist-form">
          이름
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">
              <AiFillMail />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="id"
              aria-label="id"
              defaultValue={com.storage.getItem('id')}
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          휴대폰인증
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">
              <AiFillLock />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
            <Form.Control
              type="text"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
            <Form.Control
              type="text"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
            <Button variant="primary">인증번호 발송</Button>
          </InputGroup>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
            <Button variant="primary">인증번호 인증</Button>
          </InputGroup>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
            <Button variant="primary">중복체크</Button>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">비밀번호</InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
          </InputGroup>
          <Button variant="primary" type="submit" form="regist-form">
            회원가입
          </Button>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Regist);
