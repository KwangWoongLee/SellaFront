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
        <Form onSubmit={onSubmit} id="login-modal-form" className="formbox success">
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

          <span className="inform red">8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요. </span>

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
        <div className="formbox fail">
          <h3>비밀번호 찾기</h3>

          <span>고객님 정보와 일치하지 않습니다.</span>

          <dl>
            <dt>비밀번호를 찾을수 없나요?</dt>
            <dd>
              <span>· 회원정보를 확인하여 비밀번호 찾기를 다시 시도해주세요.</span>
              <span>· 기타 이유로 비밀번호를 찾을 수 없는 경우, 고객센터로 문의주세요.</span>
              <span>· 고객센터 : 070-1111-1111</span>
            </dd>
          </dl>

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
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Login);
