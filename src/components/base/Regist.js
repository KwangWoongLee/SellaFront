import React, { useEffect, useState, useRef } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import com, {
  modal,
  logger,
  navigate,
  replace_phone,
  is_regex_phone,
  is_regex_password,
  is_regex_email,
} from 'util/com';
import Recoils from 'recoils';
import request from 'util/request';
import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';

import 'styles/Login.scss';

const agency_str = ['통신사 선택', 'SKT', 'KT', 'LG'];
const gender = ['남', '여'];
const local = ['내국인', '외국인'];
const Regist = () => {
  logger.render('Regist');

  const [registButtonOn, setRegistButtonOn] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [agencyType, setAgencyType] = useState(0);
  const [genderType, setGenderType] = useState(0);
  const [localType, setLocalType] = useState(0);
  const [auth, setAuth] = useState({
    name: false,
    phone: false,
    send_phone: false,
    auth_phone: false,
    email: false,
    auth_email: false,
    password: false,
    password_confirm: false,
    agency: false,
  });
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const authNoRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);

  useEffect(() => {
    if (!agreement.length) {
      request.post('base/info/agreement', {}).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('SELLA:AGREEMENT', data.sella_agreement);

          const agreement_temp = _.filter(_.cloneDeep(Recoils.getState('SELLA:AGREEMENT')), { type: 'regist' });
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

  useEffect(() => {
    if (agencyType) {
      const auth_temp = auth;
      auth_temp['agency'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['agency'] = false;
      setAuth({ ...auth_temp });
    }
  }, [agencyType]);

  const onNameChange = (e) => {
    let name = nameRef.current.value;
    if (name.length > 0) {
      const auth_temp = auth;
      auth_temp['name'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['name'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    for (const agreement_item of agreement) {
      if (agreement_item.essential_flag && !agreement_item.checked) {
        modal.alert('필수 동의 항목에 체크 해주세요.');
        return;
      }
    }

    const name = nameRef.current.value;
    const agency = agencyType;
    const gender = genderType;
    const local = localType;
    const phone = phoneRef.current.value;

    const password = passwordRef.current.value;
    const email = emailRef.current.value;

    if (!name) {
      modal.alert('이름을 입력 해주세요.');
      return;
    }

    if (agency === -1) {
      modal.alert('통신사를 선택 해주세요.');
      return;
    }

    request.post('/regist', { password, phone, name, email, gender, agency, local, agreement }).then((ret) => {
      if (!ret.err) {
        com.storage.setItem('tempRegistResult', email);

        navigate('/regist/result');
      } else {
        com.storage.setItem('tempRegistResult', '');
      }
    });

    logger.info(`regist : email = ${email}, password = ${password}`);
  };

  const onAuthNoChange = (e) => {
    let auth_no = authNoRef.current.value;
    if (auth_no.length > 6) {
      authNoRef.current.value = auth_no.substr(0, 6);
      return;
    }
  };

  const onCheckPhoneAuthNo = (e) => {
    const phone = phoneRef.current.value;
    const auth_no = authNoRef.current.value;
    if (auth_no)
      request.post('auth/phone/auth_no', { phone, auth_no }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['auth_phone'] = true;
          setAuth({ ...auth_temp });
        }
      });
  };

  const onSendPhoneAuthNo = (e) => {
    const phone = phoneRef.current.value;

    request.post('auth/phone', { phone }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        modal.alert(`임시방편입니다.
          ${data.random_no}
        `);

        const auth_temp = auth;
        auth_temp['send_phone'] = true;
        setAuth({ ...auth_temp });
      }
    });
  };

  const onEmailCheck = (e) => {
    const email = emailRef.current.value;

    if (email)
      request.post('regist/email', { email }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['auth_email'] = email;
          setAuth({ ...auth_temp });
        } else {
          const auth_temp = auth;
          auth_temp['auth_email'] = false;
          setAuth({ ...auth_temp });
        }
      });
  };

  const checkedItemHandler = (d) => {
    const obj = _.find(agreement, { code: d.code });
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

  const onPhoneChange = (e) => {
    let phone = phoneRef.current.value;
    if (phone.length > 13) {
      phoneRef.current.value = phone.substr(0, 13);
      return;
    }
    phone = replace_phone(phone);

    phoneRef.current.value = phone;
    if (is_regex_phone(phone)) {
      const auth_temp = auth;
      auth_temp['phone'] = phone;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['phone'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onEmailChange = (e) => {
    const email = emailRef.current.value;
    if (is_regex_email(email)) {
      const auth_temp = auth;
      auth_temp['email'] = email;
      auth_temp['auth_email'] = false;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['email'] = false;
      auth_temp['auth_email'] = false;
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

  const onClickAgreement = (e, content) => {};

  return (
    <>
      <Head />
      <Body title={`회원가입`} myClass={'regist'}>
        <Form onSubmit={onSubmit} id="regist-form" className="formbox">
          <h3>회원가입</h3>

          <div className="leftbox">
            <div className="terms">
              {agreement.map((name, key) => (
                <>
                  <span>
                    [{agreement[key].essential_flag ? '필수' : '선택'}] {agreement[key].title}
                  </span>
                  <Checkbox
                    checked={agreement[key].checked}
                    checkedItemHandler={() => {
                      checkedItemHandler(agreement[key]);
                    }}
                  ></Checkbox>
                  <label>동의</label>
                  <textarea onClick={(e) => onClickAgreement(e, agreement[key].content)} disabled={true}>
                    {agreement[key].content}
                  </textarea>
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
            <label>이름</label>
            <InputGroup className="inputname">
              <Form.Control
                ref={nameRef}
                onChange={onNameChange}
                type="text"
                placeholder="이름 입력"
                aria-label="name"
                defaultValue={''}
              />
            </InputGroup>
            <label>휴대폰인증</label>
            <DropdownButton variant="" title={agency_str[agencyType]} className="inputagency">
              {agency_str.map((name, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setAgencyType(key);
                  }}
                  active={agencyType === key}
                >
                  {agency_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <div className="btnbox">
              <ButtonGroup aria-label="gender" className="gender">
                {gender.map((name, key) => (
                  <Button
                    variant="secondary"
                    className={genderType === key ? 'btn-primary on' : 'btn-primary'}
                    key={key}
                    eventKey={key}
                    onClick={(e) => {
                      setGenderType(key);
                    }}
                    active={genderType === key}
                  >
                    {gender[key]}
                  </Button>
                ))}
              </ButtonGroup>
              <ButtonGroup aria-label="local" className="local">
                {local.map((name, key) => (
                  <Button
                    variant="secondary"
                    className={localType === key ? 'btn-primary on' : 'btn-primary'}
                    key={key}
                    eventKey={key}
                    onClick={(e) => {
                      setLocalType(key);
                    }}
                    active={localType === key}
                  >
                    {local[key]}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <InputGroup className="inputphone1">
              <Form.Control
                ref={phoneRef}
                type="text"
                placeholder="휴대폰 번호 입력"
                defaultValue={''}
                onChange={onPhoneChange}
              />
              <Button
                disabled={!(auth['name'] && auth['agency'] && auth['phone'])}
                variant="primary"
                className="btn_blue"
                onClick={onSendPhoneAuthNo}
              >
                인증번호 발송
              </Button>
            </InputGroup>
            {auth['send_phone'] ? (
              <span className="inform inform1">인증번호를 발송했습니다.</span>
            ) : auth['phone'] ? (
              <span className="inform inform1 red">인증번호를 발송하세요.</span>
            ) : (
              <br />
            )}
            <InputGroup className="inputphone2">
              <Form.Control
                ref={authNoRef}
                type="text"
                placeholder="인증번호 입력"
                defaultValue={''}
                onChange={onAuthNoChange}
              />
              <Button
                disabled={!auth['send_phone']}
                variant="primary"
                className="btn_blue"
                onClick={onCheckPhoneAuthNo}
              >
                인증하기
              </Button>
            </InputGroup>
            {auth['auth_phone'] ? (
              <span className="inform inform1">인증되었습니다.</span>
            ) : auth['send_phone'] ? (
              <span className="inform inform2 red">인증번호가 일치하지 않습니다.</span>
            ) : (
              <br />
            )}

            <label>아이디/비밀번호</label>
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
            )}

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
