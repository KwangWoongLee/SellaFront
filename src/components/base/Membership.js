import React, { useState, useEffect, useRef } from 'react';

import { Button, InputGroup, Form, Modal } from 'react-bootstrap';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import Checkbox from 'components/common/CheckBoxCell';
import { logger, modal, navigate } from 'util/com';
import { RequestPay } from 'util/payment';
import request from 'util/request';
import Recoils from 'recoils';
import useScript from 'react-script-hook';

import 'styles/Mypage.scss';

import icon_close from 'images/icon_close.svg';

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
    src: 'https://cdn.iamport.kr/v1/iamport.js',
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

  const onPaymentReq = (d) => {
    request.post('base/payment', { access_token: account.access_token, grade: d }).then((ret) => {
      if (!ret.err) {
        RequestPay(
          {
            name: d.name,
            amount: d.price,
            buyer_name: account.name,
            buyer_email: account.email,
            buyer_tel: account.phone,
          },
          (rsp) => {
            console.log(rsp);
          }
        );

        // modal.alert('결제가 완료되었습니다. 다시 로그인 해주세요.');

        // Recoils.resetState('CONFIG:ACCOUNT');
        // navigate('/');
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
        {/* <MyPageNavTab active="/mypage/membership" gradeData={gradeData} /> */}

        <div className="page">
          <div className="paymentbox">
            <h3>멤버십 혜택 안내</h3>
            <h4>
              {gradeData && gradeData.grade == 0 ? '무료' : '유료'}서비스 사용기간이 [
              {gradeData ? gradeData.remain_warranty_day : 0}]일 남았습니다.
            </h4>

            {gradeData && (
              <GradeItem
                account={{
                  email: emailRef.current.value,
                  name: nameRef.current.value,
                  phone: phoneRef.current.value,
                  access_token: account.access_token,
                }}
                d={gradeData}
                onClick={onPaymentReq}
              ></GradeItem>
            )}
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

const GradeItem = React.memo(({ index, d, onClick, account }) => {
  return (
    <div className="innerbox">
      <dl>
        <dt>{d.name}</dt>
        {d.price != 0 ? <dd>{d.price}원 / 월</dd> : <dd>무료 사용 중</dd>}
        <dd>{d.descript}</dd>
      </dl>

      <ul>{d.functions && d.functions.map((data, index) => <li>{data.name}</li>)}</ul>
      {/* <div className="terms">
        <ul>
          <li>
            {' '}
            <Checkbox></Checkbox> <label>(필수)멤버십 정기 결제 동의</label>{' '}
          </li>
          <li>
            {' '}
            <Checkbox></Checkbox> <label>(필수)1년 경과 전 해지 시, 정상가 기준으로 환불</label>{' '}
          </li>
          <li>
            {' '}
            <Checkbox></Checkbox>{' '}
            <label>
              (필수)이용약관 및 결제 및 멤버십 유의사항
              <span>
                <strong style={{ textDecoration: 'underline' }}>보기</strong>
              </span>
            </label>{' '}
          </li>
          <li>
            {' '}
            <Checkbox></Checkbox>{' '}
            <label>
              (필수)멤버십 제 3자 개인정보 제공
              <span>
                <strong style={{ textDecoration: 'underline' }}>보기</strong>
              </span>
            </label>{' '}
          </li>
          <li>
            {' '}
            <Checkbox></Checkbox> <label>(선택)멤버십 혜택 및 프로모션 알림 동의</label>{' '}
          </li>
        </ul>
        <Checkbox></Checkbox>
        <label>모두 동의합니다.</label>
      </div> */}
      {d.remain_warranty_day && d.remain_warranty_day > 0 ? (
        <Button
          className="btn-primary"
          onClick={() => {
            onClick(d, account);
          }}
        >
          사용중
        </Button>
      ) : (
        <Button
          onClick={() => {
            onClick(d, account);
          }}
          className="btn-primary btn_flblue"
        >
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
    <Modal show={modalState} onHide={onClose} centered className="modal deleteAccount">
      <Modal.Header>
        <Modal.Title>회원 탈퇴</Modal.Title>
        <Button variant="primary" className="btn_close btn btn-primary" onClick={onClose}>
          <img alt={''} src={icon_close} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <p>회원 탈퇴 전 유의사항을 확인해주세요.</p>
        <ul>
          <li>회원탈퇴 시 회원전용 웹 서비스 이용이 불가합니다.</li>
          <li>
            결제정보가 있는 경우, 전자상거래 등에서의 소비자 보호에 관한 법률에 따라 계약 또는 청약철회에 관한 기록,
            대금결제 및 재화 등의 공급에 관한 기록은 5년동안 보존됩니다.
          </li>
          <li>이미 결제가 완료된 건은 탈퇴로 취소되지 않으며 사용기간 만료일까지 서비스를 이용하실 수 있습니다.</li>
          <li>사용기간 만료일 이후 계정정보를 포함하여 등록하신 모든 정보는 폐기됩니다.</li>
        </ul>
        <div className="checkwrap">
          <Checkbox checked={checked} checkedItemHandler={checkedItemHandler}></Checkbox>
          <label>회원탈퇴 시 처리사항 안내를 확인하였음에 동의합니다.</label>
        </div>

        <div className="inputbox">
          <InputGroup className="c">
            <label>아이디</label>
            <Form.Control ref={withDrawalEmailRef} type="text" placeholder="이메일 주소" defaultValue={''} />
          </InputGroup>
          <InputGroup className="inputpassword">
            <label>비밀번호</label>
            <Form.Control ref={withDrawalPasswordRef} type="password" placeholder="비밀번호" defaultValue={''} />
          </InputGroup>
        </div>

        <Button disabled={!checked} variant="primary" onClick={onClickWithdrawal} className="btn_blue btn btn-primary">
          탈퇴하기
        </Button>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(Membership);
