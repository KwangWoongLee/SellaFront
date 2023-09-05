import React, { useState, useEffect, useRef } from 'react';

import { Button, InputGroup, Form } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import { logger } from 'util/com';
import request from 'util/request';

import 'styles/Mypage.scss';

const Membership = () => {
  logger.render('Membership');

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const newPasswordRef = useRef(null);
  const newPasswordConfirmRef = useRef(null);
  const authNoRef = useRef(null);
  const corpRef = useRef(null);
  const corpNoRef = useRef(null);
  const [gradeData, setGradeData] = useState(null);

  useEffect(() => {
    request.post('user/membership', {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        emailRef.current.value = data.email;
        nameRef.current.value = data.name;
        phoneRef.current.value = data.phone;
        corpRef.current.value = data.corperation;
        corpNoRef.current.value = data.corperation_no;

        setGradeData(data.grade_data);
      }
    });
  }, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'mypage'}>
        <MyPageNavTab active="/mypage/membership" />

        <div className="page">
          <div className="paymentbox">
            <h3>멤버십 혜택 안내</h3>

            {gradeData && gradeData.grade == 0 ? (
              <h4>무료서비스 사용기간이 [{gradeData.remain_warranty_day}]일 남았습니다.</h4>
            ) : (
              <h4>유료서비스 사용기간이 [30]일 남았습니다.</h4>
            )}

            {gradeData && <GradeItem d={gradeData}></GradeItem>}
          </div>

          <div className="formbox">
            <h3>회원정보관리</h3>
            <h4>회원님의 정보를 관리하세요.</h4>

            <div className="innerbox">
              <InputGroup className="inputid">
                <label>ID</label>
                <Form.Control ref={emailRef} type="text" placeholder="이메일 주소" aria-label="id" defaultValue={''} />
              </InputGroup>

              {/* <InputGroup className="inputpw1">
                <label>현재 비밀번호</label>
                <Form.Control type="password" placeholder="비밀번호" defaultValue={''} />
              </InputGroup> */}

              <InputGroup className="inputpw2">
                <label>새 비밀번호</label>
                <Form.Control type="password" placeholder="새 비밀번호" defaultValue={''} />
                <Form.Control type="password" placeholder="새 비밀번호 확인" defaultValue={''} />
              </InputGroup>
              <span className="inform inform1">8~16자 대/소문자, 숫자, 특수문자를 사용하세요.</span>

              <InputGroup className="inputname">
                <label>이름</label>
                <Form.Control ref={nameRef} type="text" placeholder="이름" aria-label="id" defaultValue={''} />
              </InputGroup>

              <InputGroup className="inputphone">
                <label>휴대폰 번호</label>
                <Form.Control ref={phoneRef} type="text" placeholder="휴대폰번호" aria-label="id" defaultValue={''} />
              </InputGroup>

              <span className="inform inform2">‘-’ 를 제외한 숫자만 입력해주세요.</span>

              <InputGroup className="inputcompany">
                <label>회사명</label>
                <Form.Control ref={corpRef} type="text" placeholder="회사명" aria-label="id" defaultValue={''} />
              </InputGroup>

              <InputGroup className="inputbusinessno">
                <label>사업자 번호</label>
                <Form.Control ref={corpNoRef} type="text" placeholder="사업자 번호" aria-label="id" defaultValue={''} />
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

const GradeItem = React.memo(({ index, d }) => {
  logger.render('SelectItem : ', index);
  return (
    <div className="innerbox">
      <dl>
        <dt>{d.name}</dt>
        {d.price != 0 ? <dd>{d.price}원 / 월</dd> : <dd>무료</dd>}
        <dd>{d.descript}</dd>
      </dl>

      <ul>{d.functions && d.functions.map((data, index) => <li>{data.name}</li>)}</ul>

      {/* <button className="btn-primary">사용중</button> */}
      <button className="btn-primary btn_flblue">결제하기</button>
    </div>
  );
});

export default React.memo(Membership);
