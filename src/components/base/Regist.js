import React, { useEffect, useState, useRef } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import com, { modal, logger, navigate } from 'util/com';
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

  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [agencyType, setAgencyType] = useState(0);
  const [genderType, setGenderType] = useState(-1);
  const [localType, setLocalType] = useState(-1);
  const [auth, setAuth] = useState({
    send_phone: false,
    auth_phone: false,
    email: false,
    password: false,
    password_confirm: false,
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

          const agreement_temp = _.cloneDeep(Recoils.getState('SELLA:AGREEMENT'));
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
    const authNo = authNoRef.current.value;
    const password = passwordRef.current.value;
    const email = emailRef.current.value;
    if (!name) {
      modal.alert('이름을 입력하세요.');
      return;
    }
    if (!agency) {
      modal.alert('통신사를 선택하세요.');
      return;
    }
    if (gender == -1) {
      modal.alert('성별을 선택하세요.');
      return;
    }
    if (local == -1) {
      modal.alert('국적을 선택하세요.');
      return;
    }

    for (const key in auth) {
      if (auth[key] == false) {
        modal.alert('빨간 글씨를 제거하세요.');
        return;
      }
    }

    request.post('/regist', { authNo, password, phone, name, email, gender, agency, local, agreement }).then((ret) => {
      if (!ret.err) {
        com.storage.setItem('email', email);
        com.storage.setItem('password', password);

        navigate('/regist/result');
      } else {
      }
    });

    logger.info(`submit : email = ${email}, password = ${password}`);
  };

  const onGetPhoneAuth = (e) => {
    const phone = phoneRef.current.value;
    if (!phone) {
      modal.alert('휴대폰번호를 입력하세요.');
      return;
    }

    if (phone)
      request.post('regist/phone/auth_no', { phone }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['send_phone'] = true;
          setAuth({ ...auth_temp });
        }
      });
  };

  const onSendPhoneAuth = (e) => {
    const phone = phoneRef.current.value;
    if (!phone) {
      modal.alert('휴대폰번호를 입력하세요.');
      return;
    }

    const authNo = authNoRef.current.value;
    if (!authNo) {
      modal.alert('인증번호를 입력하세요.');
      return;
    }

    request.post('regist/phone', { authNo }).then((ret) => {
      if (!ret.err) {
        const auth_temp = auth;
        auth_temp['auth_phone'] = true;
        setAuth({ ...auth_temp });
      }
    });
  };

  const onEmailCheck = (e) => {
    const email = emailRef.current.value;

    if (!email) {
      modal.alert('이메일을 입력하세요.');
      return;
    }

    if (email)
      request.post('regist/email', { email }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['email'] = true;
          setAuth({ ...auth_temp });
        } else {
        }
      });
  };

  const checkedItemHandler = (d) => {
    const obj = _.find(agreement, { code: d.code });
    obj.checked = !obj.checked;
    if (obj.checked == false) setAllChecked(false);

    setAgreement([...agreement]);
  };

  const onAllAgreementChange = () => {
    for (const agreement_item of agreement) {
      agreement_item.checked = !allChecked;
    }

    setAgreement([...agreement]);
    setAllChecked(!allChecked);
  };

  const onPasswordChange = (e) => {
    const password = passwordRef.current.value;
    if (password.length > 8) {
      const auth_temp = auth;
      auth_temp['password'] = true;
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
      auth_temp['password_confirm'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['password_confirm'] = false;
      setAuth({ ...auth_temp });
    }
  };
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
                  <textarea>{agreement[key].content}</textarea>
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
              <Form.Control ref={nameRef} type="text" placeholder="이름 입력" aria-label="name" defaultValue={''} />
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
              {/* 버튼이 클릭됐을 때 className에 on 넣어주시면 됩니다! */}
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
              <Form.Control ref={phoneRef} type="text" placeholder="휴대폰 번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue" onClick={onGetPhoneAuth}>
                인증번호 발송
              </Button>
            </InputGroup>
            {auth['send_phone'] ? (
              <span className="inform inform1">인증번호를 발송했습니다.</span>
            ) : (
              <span className="inform inform1 red">인증번호를 발송하세요.</span>
            )}
            <InputGroup className="inputphone2">
              <Form.Control ref={authNoRef} type="text" placeholder="인증번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue" onClick={onSendPhoneAuth}>
                인증하기
              </Button>
            </InputGroup>
            {auth['auth_phone'] ? (
              <span className="inform inform1">인증되었습니다!</span>
            ) : (
              <span className="inform inform2 red">인증번호가 일치하지 않습니다.</span>
            )}

            <label>아이디/비밀번호</label>
            <InputGroup className="inputid">
              <Form.Control ref={emailRef} type="text" placeholder="이메일주소" defaultValue={''} />
              <Button variant="primary" className="btn_blue" onClick={onEmailCheck}>
                중복체크
              </Button>
            </InputGroup>
            {auth['email'] ? (
              <span className="inform inform3">사용가능한 이메일입니다.</span>
            ) : (
              <span className="inform inform2 red">이미 사용한 메일입니다.</span>
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
              <span className="inform inform4"></span>
            ) : (
              <span className="inform inform4 red">8~16자 대/소문자, 숫자, 특수문자를 사용하세요.</span>
            )}
            {auth['password_confirm'] ? (
              <span className="inform inform4"></span>
            ) : (
              <span className="inform inform4 red">비밀번호 확인 문자가 다릅니다.</span>
            )}

            <Button variant="primary" type="submit" form="regist-form" className="btn_blue btn_submit">
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
