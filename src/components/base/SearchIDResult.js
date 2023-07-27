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

  return (
    <>
      <Head />
      <Body title={`아이디 찾기 성공`} myClass={'searchresult'}>
        <div className="formbox success">
          <h3>아이디 찾기</h3>

          <span>고객님 정보와 일치하는 아이디입니다.</span>

          <p>test0001@gmail.com</p>

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

        <div className="formbox fail">
          <h3>아이디 찾기</h3>

          <span>고객님 정보와 일치하는 아이디가 없습니다.</span>

          <dl>
            <dt>가입한 아이디를 찾을수 없나요?</dt>
            <dd>
              <span>
                · 회원가입을 하지 않았을 경우, 회원가입 하시면 셀러라면의 편리한 서비스를 사용하실 수 있습니다.
              </span>
              <span>· 기타 이유로 아이디를 찾을 수 없는 경우, 고객센터로 문의주세요.</span>
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

export default React.memo(SearchIDResult);
