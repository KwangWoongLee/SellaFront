import React, { useEffect, useState, useRef } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import com, { modal, logger, navigate, is_regex_password, is_regex_id, is_regex_email } from 'util/com';
import Recoils from 'recoils';
import request from 'util/request';
import _ from 'lodash';

import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';
import { RequestCert } from 'util/certification';

import 'styles/Login.scss';

const Regist = () => {
  const [registButtonOn, setRegistButtonOn] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [auth, setAuth] = useState({
    cert: false,
    id: false,
    auth_id: false,
    password: false,
    password_confirm: false,
  });
  const nameRef = useRef(null);
  const idRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);

  // RequestCert(redirect_url, (data) => {
  //   if (data) {
  //     const origin_cert = Recoils.getState('CONFIG:CERT');
  //     Recoils.setState('CONFIG:CERT', {
  //       ...origin_cert,
  //       ...data,
  //     });

  //     navigate(redirect_url);
  //   } else modal.alert('인증에 실패하였습니다.');
  // });

  useEffect(() => {
    if (!agreement.length) {
      request.post('base/info/agreement', {}).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('SELLA:AGREEMENT', data.sella_agreement);

          const agreement_temp = _.filter(_.cloneDeep(data.sella_agreement), { type: 'regist' });
          _.forEach(agreement_temp, (item) => {
            item.checked = false;
          });

          setAgreement(agreement_temp);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (allChecked && _.find(allChecked, { check: true })) setAllChecked(false);
  }, [agreement]);

  useEffect(() => {
    let isOk = true;
    for (const key in auth) {
      if (auth[key] === false) {
        isOk = false;
        break;
      }
    }

    if (isOk) setRegistButtonOn(true);
    else setRegistButtonOn(false);
  }, [auth]);

  const onSubmit = (e) => {
    e.preventDefault();
    for (const agreement_item of agreement) {
      if (agreement_item.essential_flag && !agreement_item.checked) {
        modal.alert('필수 동의 항목에 체크 해주세요.');
        return;
      }
    }

    const name = nameRef.current.value;

    const id = idRef.current.value;
    const password = passwordRef.current.value;
    const email = emailRef.current.value;

    const cert = Recoils.getState('CONFIG:CERT');
    const random_key = cert.random_key;
    if (!random_key) {
      modal.alert('비정상 접근입니다.');
      return;
    }

    request.post('/regist', { id, random_key, password, phone: '', name, email, agreement }).then((ret) => {
      if (!ret.err) {
        Recoils.setState('CONFIG:CERT', {
          random_key: '',
          name: '',
          temp_id: id,
        });

        navigate('/regist/result');
      }
    });

    logger.info(`regist : id = ${id}, password = ${password}`);
  };

  const onIDCheck = (e) => {
    const id = idRef.current.value;

    if (id)
      request.post('regist/id', { id }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['auth_id'] = id;
          setAuth({ ...auth_temp });
        } else {
          const auth_temp = auth;
          auth_temp['auth_id'] = false;
          setAuth({ ...auth_temp });
        }
      });
  };

  const checkedItemHandler = (d) => {
    const obj = _.find(agreement, { group_id: d.group_id });
    obj.checked = !obj.checked;
    if (obj.checked === false) setAllChecked(false);

    setAgreement([...agreement]);
  };

  const onAllAgreementChange = () => {
    for (const agreement_item of agreement) {
      agreement_item.checked = !allChecked;
    }

    setAgreement([...agreement]);
    setAllChecked(!allChecked);
  };

  const onEmailChange = (e) => {
    const email = emailRef.current.value;
    if (is_regex_email(email)) {
      const auth_temp = auth;
      auth_temp['email'] = email;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['email'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onIDChange = (e) => {
    const id = idRef.current.value;
    if (is_regex_id(id)) {
      const auth_temp = auth;
      auth_temp['id'] = id;
      auth_temp['auth_id'] = false;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['id'] = false;
      auth_temp['auth_id'] = false;
      setAuth({ ...auth_temp });
    }
  };

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

  return (
    <>
      <Head_NoLogin />
      <Body title={`회원가입`} myClass={'regist'}>
        <Form onSubmit={onSubmit} id="regist-form" className="formbox">
          <h3>회원가입</h3>

          <div className="leftbox">
            <div className="terms">
              {agreement.map((name, key) => (
                <>
                  <span>
                    [{agreement[key].essential_flag ? '필수' : '선택'}] {agreement[key].group_title}
                  </span>
                  <Checkbox
                    checked={agreement[key].checked}
                    checkedItemHandler={() => {
                      checkedItemHandler(agreement[key]);
                    }}
                  ></Checkbox>
                  <label>동의</label>
                  <textarea disabled={true}>{agreement[key].contents[0].content}</textarea>
                </>
              ))}
            </div>
            <div className="terms">
              <Checkbox
                checked={allChecked}
                checkedItemHandler={() => {
                  onAllAgreementChange();
                }}
              ></Checkbox>
              <label>전체 약관에 모두 동의합니다.</label>
            </div>
          </div>
          <div className="rightbox">
            {auth['cert'] ? (
              <>
                <label>이름</label>
                <InputGroup className="inputname">
                  <Form.Control disabled={true} ref={nameRef} type="text" aria-label="name" />
                </InputGroup>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="btn_blue btn_submit"
                  onClick={() => {
                    RequestCert('', (data) => {
                      if (data) {
                        const origin_cert = Recoils.getState('CONFIG:CERT');
                        Recoils.setState('CONFIG:CERT', {
                          ...origin_cert,
                          ...data,
                        });

                        const auth_temp = auth;
                        auth_temp['cert'] = true;
                        setAuth({ ...auth_temp });

                        nameRef.current.value = data.name;
                      } else modal.alert('인증에 실패하였습니다.');
                    });
                  }}
                >
                  휴대폰 본인인증
                </Button>{' '}
              </>
            )}

            <label>아이디/비밀번호</label>
            <InputGroup className="inputid">
              <Form.Control ref={idRef} type="text" placeholder="아이디" defaultValue={''} onChange={onIDChange} />
              <Button disabled={!auth['id']} variant="primary" className="btn_blue" onClick={onIDCheck}>
                중복체크
              </Button>
            </InputGroup>
            {auth['id'] && auth['auth_id'] ? <span className="inform inform3">사용가능한 아이디입니다.</span> : <br />}
            {/* 
            <InputGroup className="inputid">
              <Form.Control
                ref={emailRef}
                type="text"
                placeholder="이메일주소"
                defaultValue={''}
                onChange={onEmailChange}
              />
              <Button disabled={!auth['email']} variant="primary" className="btn_blue" onClick={onEmailCheck}>
                중복체크
              </Button>
            </InputGroup>
            {auth['email'] && auth['auth_email'] ? (
              <span className="inform inform3">사용가능한 이메일입니다.</span>
            ) : (
              <br />
            )} */}

            <InputGroup className="inputpw1">
              <Form.Control
                ref={passwordRef}
                type="password"
                placeholder="비밀번호"
                defaultValue={''}
                onChange={onPasswordChange}
              />
            </InputGroup>
            <InputGroup className="inputpw2">
              <Form.Control
                ref={passwordConfirmRef}
                type="password"
                placeholder="비밀번호 확인"
                defaultValue={''}
                onChange={onPasswordConfirmChange}
              />
            </InputGroup>
            {auth['password'] ? (
              auth['password_confirm'] ? (
                <span className="inform inform4"></span>
              ) : (
                <span className="inform inform4 red">비밀번호 확인 문자가 다릅니다.</span>
              )
            ) : (
              <span className="inform inform4 red">8~16자 영문, 숫자, 특수문자를 사용하세요.</span>
            )}

            <label>이메일 입력</label>
            <InputGroup className="inputemail">
              <Form.Control
                ref={emailRef}
                type="text"
                placeholder="이메일 입력"
                defaultValue={''}
                onChange={onEmailChange}
              />
            </InputGroup>
            {auth['email'] ? (
              <br />
            ) : (
              <span className="inform inform5 red">‘@’ 를 포함한 이메일 주소를 정확히 입력해주세요.</span>
            )}

            <Button
              variant="primary"
              disabled={!registButtonOn}
              type="submit"
              form="regist-form"
              className="btn_blue btn_submit"
            >
              회원가입
            </Button>
          </div>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Regist);
