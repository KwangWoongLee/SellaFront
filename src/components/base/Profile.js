import React, { useEffect } from 'react';

import { Button, InputGroup, Form } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import { logger } from 'util/com';

import 'styles/Login.scss';

const Profile = () => {
  //logger.debug('Profile');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'myprofile'}>
        <MyPageNavTab active="/mypage/profile" />

        <div className="page">
          <div className="formbox">
            <h3>회원정보관리</h3>

            <InputGroup className="inputid">
              <label>ID</label>
              <Form.Control type="text" placeholder="이메일 주소" aria-label="id" defaultValue={''} />
            </InputGroup>

            <InputGroup className="inputpw1">
              <label>현재 비밀번호</label>
              <Form.Control type="password" placeholder="비밀번호" defaultValue={''} />
            </InputGroup>

            <InputGroup className="inputpw2">
              <label>새 비밀번호</label>
              <Form.Control type="password" placeholder="새 비밀번호" defaultValue={''} />
              <Form.Control type="password" placeholder="새 비밀번호 확인" defaultValue={''} />
            </InputGroup>
            <span className="inform inform1">8~16자 대/소문자, 숫자, 특수문자를 사용하세요.</span>

            <InputGroup className="inputname">
              <label>이름</label>
              <Form.Control type="text" placeholder="이름" aria-label="id" defaultValue={''} />
            </InputGroup>

            <InputGroup className="inputphone">
              <label>휴대폰 번호</label>
              <Form.Control type="text" placeholder="휴대폰번호" aria-label="id" defaultValue={''} />
            </InputGroup>

            <span className="inform inform2">‘-’ 를 제외한 숫자만 입력해주세요.</span>

            <InputGroup className="inputcompany">
              <label>회사명</label>
              <Form.Control type="text" placeholder="회사명" aria-label="id" defaultValue={''} />
            </InputGroup>

            <InputGroup className="inputbusinessno">
              <label>사업자 번호</label>
              <Form.Control type="text" placeholder="사업자 번호" aria-label="id" defaultValue={''} />
            </InputGroup>

            <Button variant="primary" type="submit" form="regist-form" className="btn_blue btn_submit">
              수정완료
            </Button>

            <Button variant="primary" className="btn_txt">
              회원 탈퇴하기
            </Button>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

for (const name in process.env) {
  logger.info(`${name} = ${process.env[name]}`);
}

export default React.memo(Profile);
