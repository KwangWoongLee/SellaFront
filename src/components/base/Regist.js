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
const gender = ['남', '여'];
const local = ['내국인', '외국인'];

const Regist = () => {
  logger.render('Regist');

  const [agencyType, setAgencyType] = useState(0);
  const [genderType, setGenderType] = useState(0);
  const [localType, setLocalType] = useState(0);
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



    request.post('user/regist', { id, password, phone, name, email, gender, local }).then((ret) => {
      if (!ret.err) {
        com.storage.setItem('id', id);
        com.storage.setItem('password', password);
        
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
              <label>전체 약관에 모두 동의합니다.</label>
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
              <Form.Control type="text" placeholder="휴대폰 번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                인증번호 발송
              </Button>
            </InputGroup>
            <span className="inform inform1">인증번호를 발송했습니다.</span>
            <InputGroup className="inputphone2">
              <Form.Control type="text" placeholder="인증번호 입력" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                인증하기
              </Button>
            </InputGroup>
            {/* 경고 텍스트 span.inform 만들어뒀어용, 기본은 초록색으로 나오고, red 클래스로 폰트색 바꾸고 vhidden 으로 숨길수 있습니다. 
            각 필요한 영역마다 넣어두었고 inform1 ~ inform4 까지 있습니다.*/}
            <span className="inform inform2 red">인증번호가 일치하지 않습니다.</span>
            <label>아이디/비밀번호</label>
            <InputGroup className="inputid">
              <Form.Control type="text" placeholder="이메일주소" defaultValue={''} />
              <Button variant="primary" className="btn_blue">
                중복체크
              </Button>
            </InputGroup>
            <span className="inform inform3 vhidden">사용가능한 이메일입니다.</span>
            <InputGroup className="inputpw1">
              <Form.Control type="password" placeholder="비밀번호" defaultValue={''} />
            </InputGroup>
            <InputGroup className="inputpw2">
              <Form.Control type="password" placeholder="비밀번호 확인" defaultValue={''} />
            </InputGroup>
            <span className="inform inform4 vhidden">8~16자 대/소문자, 숫자, 특수문자를 사용하세요.</span>
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
