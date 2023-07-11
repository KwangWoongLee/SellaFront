import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate } from 'util/com';
import { AiFillMail, AiFillLock } from 'react-icons/ai';
import request from 'util/request';
// import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import 'styles/Login.scss';

const agency_str = ['통신사 선택', 'SKT', 'KT', 'LG'];
const month_str = ['월', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const SearchID = () => {
  logger.render('SearchID');

  useEffect(() => {}, []);

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

    logger.info(`submit : id = ${id}, password = ${password}`);
  };

  return (
    <>
      <Head />
      <Body title={`아이디 찾기`} myClass={'searchid'}>
        <Form onSubmit={onSubmit} id="login-modal-form" className="formbox">
          <h3>아이디 찾기</h3>

          <div className="termsbox">
            <div className="terms">
              <input type={'checkbox'}></input>
              <label>아래 약관에 모두 동의합니다.</label>
            </div>
            <ul className="terms">
              <li>
                <input type={'checkbox'}></input>
                <label>
                  인증시 개인정보 이용 <button>보기</button>
                </label>
              </li>
              <li>
                <input type={'checkbox'}></input>
                <label>
                  인증시 고유식별정보처리 <button>보기</button>
                </label>
              </li>
              <li>
                <input type={'checkbox'}></input>
                <label>
                  통신사 이용약관 <button>보기</button>
                </label>
              </li>
              <li>
                <input type={'checkbox'}></input>
                <label>
                  인증사 이용약관 <button>보기</button>
                </label>
              </li>
            </ul>
          </div>
          <span className="inform inform1 red">개인정보처리에 대한 동의가 필요합니다.</span>

          <label>이름</label>
          <InputGroup className="inputname">
            <Form.Control type="text" placeholder="이름 입력" defaultValue={''} />
          </InputGroup>

          <label>휴대폰 인증</label>
          <InputGroup className="inputphone1">
            <Form.Control type="text" placeholder="생년월일" defaultValue={''} disabled />
            <Form.Control type="text" placeholder="년(4자)" defaultValue={''} />
            <DropdownButton variant="" title={month_str[agencyType]} className="inputagency">
              {month_str.map((name, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setAgencyType(key);
                  }}
                  active={agencyType === key}
                >
                  {month_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Form.Control type="text" placeholder="일" defaultValue={''} />
          </InputGroup>
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
          <Button variant="primary" type="submit" form="regist-form" className="btn_blue btn_submit">
            확인
          </Button>
        </Form>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SearchID);
