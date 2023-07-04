import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import com, { logger, navigate } from 'util/com';
import request from 'util/request';
// import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import 'styles/Login.scss';

const agency_str = ['통신사 선택', 'SKT', 'KT', 'LG'];

const Regist = () => {
  logger.render('Regist');

  const [agencyType, setAgencyType] = useState(0);
  useEffect(() => {}, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const name = e.currentTarget[0].value;
    const gender = 1;

    const local = 1;
    const phone = e.currentTarget[6].value;

    const id = e.currentTarget[10].value;
    const password = e.currentTarget[12].value;
    const email = '';

    com.storage.setItem('id', id);
    com.storage.setItem('password', password);

    request.post('user/regist', { id, password, phone, name, email, gender, local }).then((ret) => {
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
      <Body title={`회원가입`} myClass={'login regist'}>
        <h3>회원가입</h3>
        <div className="termsbox">
          <div className="terms1">
            <span>[필수] 서비스 이용약관</span>
            <label>동의</label>
            <input type={'checkbox'}></input>
            <textarea>
              여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
              네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
            </textarea>
          </div>
          <div className="terms2">
            <span>[필수] 개인정보 수집 및 이용</span>
            <label>동의</label>
            <input type={'checkbox'}></input>
            <textarea>
              여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
              네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
            </textarea>
          </div>
          <div className="terms3">
            <span>[선택] 마케팅정보 활용</span>
            <label>동의</label>
            <input type={'checkbox'}></input>
            <textarea>
              여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
              네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
            </textarea>
          </div>
          <label>전체 약관 동의</label>
          <input type={'checkbox'}></input>
        </div>
        <Form onSubmit={onSubmit} id="regist-form">
          이름
          <InputGroup className="mb-3">
            <Form.Control type="text" placeholder="이름 입력" aria-label="name" defaultValue={''} />
          </InputGroup>
          휴대폰인증
          <DropdownButton variant="" title={agency_str[agencyType]}>
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
          <ButtonGroup aria-label="gender">
            <Button variant="secondary">남</Button>
            <Button variant="secondary">여</Button>
          </ButtonGroup>
          <ButtonGroup aria-label="local">
            <Button variant="secondary">내국인</Button>
            <Button variant="secondary">외국인</Button>
          </ButtonGroup>
          <InputGroup className="mb-3">
            <Form.Control type="text" placeholder="휴대폰 번호 입력" defaultValue={''} />
            <Button variant="primary">인증번호 발송</Button>
          </InputGroup>
          <InputGroup className="mb-3">
            <Form.Control type="text" placeholder="인증번호 입력" defaultValue={''} />
            <Button variant="primary">인증하기</Button>
          </InputGroup>
          아이디/비밀번호
          <InputGroup className="mb-3">
            <Form.Control type="text" placeholder="이메일주소" defaultValue={''} />
            <Button variant="primary">중복체크</Button>
          </InputGroup>
          <InputGroup className="mb-3">
            <Form.Control type="password" placeholder="비밀번호" defaultValue={''} />
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
