import React, { useEffect } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate } from 'util/com';
import { AiFillMail, AiFillLock } from 'react-icons/ai';
import request from 'util/request';

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
      <Body title={`손익 계산`}>
        <Form onSubmit={onSubmit} id="login-modal-form">
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
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">
              <AiFillLock />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="password"
              aria-label="password"
              defaultValue={com.storage.getItem('password')}
              aria-describedby="basic-addon2"
            />
          </InputGroup>
          <Button variant="primary" type="submit" form="login-modal-form">
            로그인
          </Button>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Login);
