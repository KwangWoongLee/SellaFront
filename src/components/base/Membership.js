import React, { useEffect } from 'react';

import { Button, InputGroup, Form } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import { logger } from 'util/com';

import 'styles/Mypage.scss';

const Membership = () => {
  logger.render('Membership');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'mypage'}>
        <MyPageNavTab active="/mypage/membership" />

        <div className="page">
          <div className="paymentbox">
            <h3>멤버십 혜택 안내</h3>
            {/* <h4>유료서비스 사용기간이 [30]일 남았습니다.</h4> */}
            <h4>무료서비스 사용기간이 [7]일 남았습니다.</h4>

            <div className="innerbox">
              <dl>
                <dt>Basic</dt>
                <dd>9,900원 / 월</dd>
                <dd>고객님께 꼭 필요한 기능을 준비했습니다.</dd>
              </dl>

              <ul>
                <li>주문 별 손익계산</li>
                <li>오늘 주문 손익 합계</li>
                <li>마진율 계산기</li>
                <li>사입 계산기</li>
                <li>엑셀 양식 설정</li>
              </ul>

              {/* <button className="btn-primary">사용중</button> */}
              <button className="btn-primary btn_flblue">결제하기</button>
            </div>
          </div>

          <div className="formbox">
            <h3>회원정보관리</h3>
            <h4>회원님의 정보를 관리하세요.</h4>

            <div className="innerbox">
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
        </div>
      </Body>
      <Footer />
    </>
  );
};

for (const name in process.env) {
  logger.info(`${name} = ${process.env[name]}`);
}

export default React.memo(Membership);
