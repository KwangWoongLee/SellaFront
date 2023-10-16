import React, { useState, useEffect, useRef } from 'react';

import { Button, InputGroup, Form, Modal } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import Checkbox from 'components/common/CheckBoxCell';
import { logger, modal, navigate } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import useScript from 'react-script-hook';

import 'styles/Mypage.scss';

const Membership = () => {
  logger.render('Membership');

  const account = Recoils.useValue('CONFIG:ACCOUNT');

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const newPasswordConfirmRef = useRef(null);
  const corpRef = useRef(null);
  const corpNoRef = useRef(null);
  const [gradeData, setGradeData] = useState(null);

  const [modalState, setModalState] = useState(false);

  const [loading, error] = useScript({
    src: 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js',
    onload: () => {
      window.IMP.init('imp85285548');
    },
    checkForExisting: true,
  });

  useEffect(() => {
    request.post('base/membership', { access_token: account.access_token }).then((ret) => {
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

  const onPaymentReq = () => {
    request.post('base/payment', { access_token: account.access_token }).then((ret) => {
      if (!ret.err) {
        modal.alert('결제가 완료되었습니다. 다시 로그인 해주세요.');

        Recoils.resetState('CONFIG:ACCOUNT');
        navigate('/');
      }
    });
  };

  const onClickModify = (e) => {
    e.preventDefault();

    const new_email = emailRef.current.value;
    const new_name = nameRef.current.value;
    const password = passwordRef.current.value;
    const new_phone = phoneRef.current.value;
    const new_password = newPasswordRef.current.value ? newPasswordRef.current.value : passwordRef.current.value;
    const new_corperation = corpRef.current.value;
    const new_corperation_no = corpNoRef.current.value;

    if (!new_email || !new_name || !password || !new_phone) {
      modal.alert('올바른 정보를 입력해주세요.');
      return;
    }

    request
      .post('base/membership/modify', {
        access_token: account.access_token,
        new_email,
        new_name,
        password,
        new_phone,
        new_password,
        new_corperation,
        new_corperation_no,
      })
      .then((ret) => {
        if (!ret.err) {
          modal.alert('정보 수정이 완료되었습니다. 다시 로그인 해주세요.');

          Recoils.resetState('CONFIG:ACCOUNT');
          navigate('/');
        }
      });
  };

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'mypage'}>
        <MyPageNavTab active="/mypage/membership" gradeData={gradeData} />

        <div className="page">
          <div className="paymentbox">
            <h3>멤버십 혜택 안내</h3>
            <h4>
              {gradeData && gradeData.grade == 0 ? '무료' : '유료'}서비스 사용기간이 [
              {gradeData ? gradeData.remain_warranty_day : 0}]일 남았습니다.
            </h4>

            {gradeData && <GradeItem d={gradeData} onClick={onPaymentReq} onTestClick={onTestClick}></GradeItem>}
          </div>

          <div className="formbox">
            <h3>회원정보관리</h3>
            <h4>회원님의 정보를 관리하세요.</h4>

            <div className="innerbox">
              <InputGroup className="inputid">
                <label>ID</label>
                <Form.Control ref={emailRef} type="text" placeholder="이메일 주소" aria-label="id" defaultValue={''} />
              </InputGroup>

              <InputGroup className="inputpw1">
                <label>현재 비밀번호</label>
                <Form.Control ref={passwordRef} type="password" placeholder="비밀번호" defaultValue={''} />
              </InputGroup>

              <InputGroup className="inputpw2">
                <label>새 비밀번호</label>
                <Form.Control ref={newPasswordRef} type="password" placeholder="새 비밀번호" defaultValue={''} />
                <Form.Control
                  ref={newPasswordConfirmRef}
                  type="password"
                  placeholder="새 비밀번호 확인"
                  defaultValue={''}
                />
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

              <Button
                variant="primary"
                type="submit"
                form="regist-form"
                className="btn_blue btn_submit"
                onClick={onClickModify}
              >
                수정완료
              </Button>

              <Button
                variant="primary"
                className="btn_txt"
                onClick={() => {
                  setModalState(true);
                }}
              >
                회원 탈퇴하기
              </Button>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
      <WithDrawalModal modalState={modalState} setModalState={setModalState} account={account}></WithDrawalModal>{' '}
    </>
  );
};

const onTestClick = () => {
  window.IMP.request_pay(
    {
      // param
      pg: 'inicis.INIBillTst',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: '1개월 결제',
      amount: 1000,
      currency: 'KRW',
      buyer_name: '이광웅',
      buyer_email: 'Iamport@chai.finance',
      buyer_tel: '010-5852-9537', // 필수
      buyer_addr: '서울특별시 강남구 삼성동',
      buyer_postcode: '123-456',
    },
    (rsp) => {
      // callback
      if (rsp.success) {
        console.log(123);
      } else {
        console.log(456);
      }
    }
  );
};

const GradeItem = React.memo(({ index, d, onClick, onTestClick }) => {
  return (
    <div className="innerbox">
      <dl>
        <dt>{d.name}</dt>
        {d.price != 0 ? <dd>{d.price}원 / 월</dd> : <dd>무료 사용 중</dd>}
        <dd>{d.descript}</dd>
      </dl>

      <ul>{d.functions && d.functions.map((data, index) => <li>{data.name}</li>)}</ul>

      <Button onClick={onTestClick} className="btn-primary btn_flblue">
        테스트 결제하기
      </Button>

      {d.remain_warranty_day && d.remain_warranty_day > 0 ? (
        <Button className="btn-primary">사용중</Button>
      ) : (
        <Button onClick={onClick} className="btn-primary btn_flblue">
          결제하기
        </Button>
      )}
    </div>
  );
});

const WithDrawalModal = React.memo(({ modalState, setModalState, account }) => {
  logger.render('WithDrawalModal');

  const [checked, setChecked] = useState(false);
  const withDrawalEmailRef = useRef(null);
  const withDrawalPasswordRef = useRef(null);

  const onClose = () => {
    setModalState(false);
  };

  const onClickWithdrawal = (e) => {
    e.preventDefault();
    const email = withDrawalEmailRef.current.value;
    const password = withDrawalPasswordRef.current.value;

    if (!email || !password || account.email != email) {
      modal.alert('올바른 정보를 입력해주세요.');
      return;
    }

    request
      .post('user/membership/withdrawal', { access_token: account.access_token, agreement: checked, email, password })
      .then((ret) => {
        if (!ret.err) {
          modal.alert('회원탈퇴가 정상적으로 완료되었습니다.');

          Recoils.resetState('CONFIG:ACCOUNT');
          navigate('/');
        }
      });
  };

  const checkedItemHandler = (d) => {
    setChecked(d);
  };

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal searchmodal_calculator">
      <Modal.Header>
        <Modal.Title>회원 탈퇴</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Checkbox checked={checked} checkedItemHandler={checkedItemHandler}></Checkbox>
        <span>회원탈퇴 시 처리사항 안내를 확인하였음에 동의합니다.</span>

        <InputGroup className="inputid">
          <label>아이디</label>
          <Form.Control ref={withDrawalEmailRef} type="text" placeholder="이메일 주소" defaultValue={''} />
        </InputGroup>
        <InputGroup className="inputpassword">
          <label>비밀번호</label>
          <Form.Control ref={withDrawalPasswordRef} type="password" placeholder="비밀번호" defaultValue={''} />
        </InputGroup>
        <Button disabled={!checked} variant="primary" onClick={onClickWithdrawal}>
          탈퇴하기
        </Button>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(Membership);
