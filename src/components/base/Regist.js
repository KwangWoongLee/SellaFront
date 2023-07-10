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
      <Body title={`회원가입`} myClass={'regist'}>
        <Form onSubmit={onSubmit} id="regist-form" className="formbox">
          <h3>회원가입</h3>

          <div className="leftbox">
            <div className="terms">
              <span>[필수] 서비스 이용약관</span>
              <input type={'checkbox'}></input>
              <label>동의</label>
              <textarea>
                여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
                네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
              </textarea>
            </div>
            <div className="terms">
              <span>[필수] 개인정보 수집 및 이용</span>
              <input type={'checkbox'}></input>
              <label>동의</label>
              <textarea>
                여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
                네이버 서비스의 이용과 관련하여 네이버 서비스를 제공 여러분을 환영합니다. 네이버 서비스 및 제품(이하
                ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한 네이버 서비스의 이용과 관련하여 네이버 서비스를
                제공 여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은
                다양한 네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
              </textarea>
            </div>
            <div className="terms">
              <span>[선택] 마케팅정보 활용</span>
              <input type={'checkbox'}></input>
              <label>동의</label>
              <textarea>
                여러분을 환영합니다. 네이버 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한
                네이버 서비스의 이용과 관련하여 네이버 서비스를 제공
              </textarea>
            </div>
            <div className="terms">
              <input type={'checkbox'}></input>
              <label>전체 약관 동의</label>
            </div>
          </div>
          <div className="rightbox">
            <label>이름</label>
            <InputGroup className="inputname">
              <Form.Control type="text" placeholder="이름 입력" aria-label="name" defaultValue={''} />
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
                <Button variant="secondary" className="btn-primary on">
                  남
                </Button>
                <Button variant="secondary" className="btn-primary">
                  여
                </Button>
              </ButtonGroup>
              <ButtonGroup aria-label="local" className="local">
                <Button variant="secondary" className="btn-primary on">
                  내국인
                </Button>
                <Button variant="secondary" className="btn-primary">
                  외국인
                </Button>
              </ButtonGroup>
            </div>
            <InputGroup className="inputphone1">
              <Form.Control type="text" placeholder="휴대폰 번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                인증번호 발송
              </Button>
            </InputGroup>
            <InputGroup className="inputphone2">
              <Form.Control type="text" placeholder="인증번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                인증하기
              </Button>
            </InputGroup>
            <label>아이디/비밀번호</label>
            <InputGroup className="inputid">
              <Form.Control type="text" placeholder="이메일주소" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                중복체크
              </Button>
            </InputGroup>
            <InputGroup className="inputpw1">
              <Form.Control type="password1" placeholder="비밀번호" defaultValue={''} />
            </InputGroup>
            <InputGroup className="inputpw2">
              <Form.Control type="password2" placeholder="비밀번호 확인" defaultValue={''} />
            </InputGroup>
            <Button variant="primary" type="submit" form="regist-form" className="btn_blue">
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
