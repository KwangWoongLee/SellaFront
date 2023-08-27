import React, { useRef, useState, useEffect } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, is_regex_password, modal } from 'util/com';
import { AiFillMail, AiFillLock } from 'react-icons/ai';
import request from 'util/request';
// import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

const SearchPWResult = () => {
  logger.render('SearchPWResult');

  const [mode, setMode] = useState(0);
  const [auth, setAuth] = useState({
    password: false,
    password_confirm: false,
  });
  const [changeRefButtonOn, setChangeRefButtonOn] = useState(false);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);

  useEffect(() => {
    let isOk = true;
    for (const key in auth) {
      if (auth[key] == false) {
        isOk = false;
        break;
      }
    }

    if (isOk) setChangeRefButtonOn(true);
    else setChangeRefButtonOn(false);
  }, [auth]);

  const onPasswordChange = (e) => {
    const password = passwordRef.current.value;
    if (is_regex_password(password)) {
      const auth_temp = auth;
      auth_temp['password'] = password;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['password'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onPasswordConfirmChange = (e) => {
    const password = passwordRef.current.value;
    const passwordConfirm = passwordConfirmRef.current.value;
    if (password == passwordConfirm) {
      const auth_temp = auth;
      auth_temp['password_confirm'] = passwordConfirm;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['password_confirm'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onPasswordChangeReq = () => {
    const password = passwordRef.current.value;
    if (password)
      request.post('auth/patch/password', { password }).then((ret) => {
        if (!ret.err) {
          modal.alert('변경되었습니다.');
          navigate('login');
        }
      });
  };

  return (
    <>
      <Head />
      <Body title={`비밀번호 찾기 성공`} myClass={'searchresult'}>
        {mode == 1 && (
          <Form id="change-password-form" className="formbox success">
            <h3>비밀번호 변경</h3>

            <span>안전한 비밀번호로 변경해주세요.</span>

            <InputGroup className="input_password">
              <label>새 비밀번호</label>
              <Form.Control
                ref={passwordRef}
                type="password"
                placeholder="새 비밀번호"
                defaultValue={''}
                onChange={onPasswordChange}
              />
            </InputGroup>

            <InputGroup className="input_password_confirm">
              <label>새 비밀번호 확인</label>
              <Form.Control
                ref={passwordConfirmRef}
                type="password"
                placeholder="새 비밀번호 확인"
                defaultValue={''}
                onChange={onPasswordConfirmChange}
              />
            </InputGroup>

            <span className="inform red">8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요. </span>

            <div className="btnbox">
              <Button
                disabled={!changeRefButtonOn}
                variant="primary"
                onClick={onPasswordChangeReq}
                className="btn_blue"
              >
                비밀번호 변경
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  navigate('/login');
                }}
              >
                로그인
              </Button>
            </div>
          </Form>
        )}

        {mode == 0 && (
          <div className="formbox fail">
            <h3>비밀번호를 찾을 수 없습니다.</h3>

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
        )}
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SearchPWResult);
