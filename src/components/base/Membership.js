import React, { useState, useEffect, useRef } from 'react';

import { Button, InputGroup, Form, Modal } from 'react-bootstrap';
import com, { img_src } from 'util/com';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import Checkbox from 'components/common/CheckBoxCell';
import { logger, modal, navigate, is_regex_password, is_regex_email } from 'util/com';
import { RequestPay, RequestPayPeriod } from 'util/payment';
import request from 'util/request';
import Recoils from 'recoils';
import useScript from 'react-script-hook';

import 'styles/Mypage.scss';

import icon_close from 'images/icon_close.svg';
import img_stamp10sale from 'images/img_stamp10sale.svg';
import img_salearrow from 'images/img_salearrow.svg';

const Membership = () => {
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const sella_grade = Recoils.getState('SELLA:GRADE');

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const idRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const newPasswordConfirmRef = useRef(null);
  const corpRef = useRef(null);
  const corpNoRef = useRef(null);
  const [modifyButtonOn, setModifyButtonOn] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [auth, setAuth] = useState({
    email: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [modalState, setModalState] = useState(false);

  useScript({
    src: 'https://cdn.iamport.kr/v1/iamport.js',
    onload: () => {
      window.IMP.init('imp85285548');
    },
    checkForExisting: true,
  });

  useEffect(() => {
    let isOk = true;
    for (const key in auth) {
      if (auth[key] === '') {
        continue;
      }
      if (auth[key] === false) {
        isOk = false;
        break;
      }
    }

    if (isOk) setModifyButtonOn(true);
    else setModifyButtonOn(false);
  }, [auth]);

  useEffect(() => {
    request.post('base/membership', { access_token: account.access_token }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        idRef.current.value = data.id;
        emailRef.current.value = data.email;
        nameRef.current.value = data.name;
        phoneRef.current.value = data.phone;
        corpRef.current.value = data.corperation;
        corpNoRef.current.value = data.corperation_no;

        const auth_temp = auth;
        auth_temp['email'] = data.email;
        setAuth({ ...auth_temp });

        setAccountData({
          grade: data.grade,
          remain_warranty_day: data.remain_warranty_day,
        });
      }
    });
  }, []);

  const onPaymentReq = (d) => {
    RequestPay(d, () => {
      console.log();
    });
  };

  const onPaymentReqPeriod = (d) => {
    RequestPayPeriod(d, () => {
      console.log();
    });
  };

  const onEmailChange = (e) => {
    const email = emailRef.current.value;
    if (is_regex_email(email)) {
      const auth_temp = auth;
      auth_temp['email'] = email;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['email'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onPasswordChange = (e) => {
    const password = newPasswordRef.current.value;
    if (is_regex_password(password)) {
      const auth_temp = auth;
      auth_temp['new_password'] = password;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['new_password'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onPasswordConfirmChange = (e) => {
    const password = newPasswordRef.current.value;
    const passwordConfirm = newPasswordConfirmRef.current.value;
    if (password == passwordConfirm) {
      const auth_temp = auth;
      auth_temp['new_password_confirm'] = passwordConfirm;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['new_password_confirm'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onClickModify = (e) => {
    e.preventDefault();

    const new_email = emailRef.current.value;
    const password = passwordRef.current.value;
    const new_password = newPasswordRef.current.value ? newPasswordRef.current.value : passwordRef.current.value;
    const new_corperation = corpRef.current.value;
    const new_corperation_no = corpNoRef.current.value;

    if (!password) {
      modal.alert('현재 비밀번호를 입력해주세요.');
      return;
    }

    request
      .post('base/membership/modify', {
        access_token: account.access_token,
        password,
        new_email,
        new_password,
        new_corperation,
        new_corperation_no,
      })
      .then((ret) => {
        if (!ret.err) {
          modal.alert('정보 수정이 완료되었습니다. 다시 로그인 해주세요.');

          Recoils.resetState('CONFIG:ACCOUNT');
          navigate('/login');
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
              {accountData && accountData.grade !== 0 && accountData.grade !== 1 && '유료'}서비스 사용기간이 [
              {accountData ? accountData.remain_warranty_day : 0}]일 남았습니다.
            </h4>

            <ul className="payoptionbox">
              <li>
                <p>
                  Basic
                  <span>
                    19,900 원 / 월<i>(VAT 별도)</i>
                  </span>
                </p>
                <span>
                  매출 집계와 손익 계산에 최적화된
                  <br />
                  셀라의 기능을 사용하고 싶다면
                </span>
                <ol>
                  <li>기준 상품 관리</li>
                  <li>손익 계산</li>
                  <li>손익 캘린더</li>
                  <li>마진 계산기 (계산 결과 저장)</li>
                  <li>최저가 계산기 (계산 결과 저장)</li>
                </ol>
                <hr />
                <p className="txt_blue">
                  정기결제 할인 특가
                  <img src={`${img_src}${img_stamp10sale}`} />
                </p>
                <span>
                  정기 결제 신청하고
                  <br />
                  반드시 누려야할 10% 할인!
                </span>
                <div className="salebox">
                  <dl>
                    <dt>정상가</dt>
                    <dd>
                      19,900<i>원</i>
                      <img src={`${img_src}${img_salearrow}`} />
                    </dd>
                  </dl>
                  <dl>
                    <dt>정기결제 10% OFF</dt>
                    <dd>
                      17,900<i>원</i>
                    </dd>
                  </dl>
                </div>

                <hr />

                <select name="" id="">
                  <option value="">결제 옵션 선택</option>
                  <option value="">정기 결제 특가 : 17,900 원 (vat별도)</option>
                  <option value="">1달 결제 : 19,900 원 (vat별도)</option>
                </select>
                <Button>요금제 선택하기</Button>
              </li>
            </ul>

            {sella_grade &&
              sella_grade.map(
                (sella_grade_data, index) =>
                  !sella_grade_data.no_show && (
                    <GradeItem
                      account_data={accountData}
                      grade_data={sella_grade_data}
                      onClick={sella_grade_data.period_flag ? onPaymentReqPeriod : onPaymentReq}
                    ></GradeItem>
                  )
              )}
          </div>

          <div className="formbox">
            <h3>회원정보관리</h3>
            <h4>회원님의 정보를 관리하세요.</h4>

            <div className="innerbox">
              <InputGroup className="inputid">
                <label>ID</label>
                <Form.Control
                  disabled={true}
                  ref={idRef}
                  type="text"
                  placeholder="이메일 주소"
                  aria-label="id"
                  defaultValue={''}
                />
              </InputGroup>

              <InputGroup className="inputname">
                <label>이름</label>
                <Form.Control
                  disabled={true}
                  ref={nameRef}
                  type="text"
                  placeholder="이름"
                  aria-label="id"
                  defaultValue={''}
                />
              </InputGroup>

              <InputGroup className="inputphone">
                <label>휴대폰 번호</label>
                <Form.Control
                  disabled={true}
                  ref={phoneRef}
                  type="text"
                  placeholder="휴대폰번호"
                  aria-label="id"
                  defaultValue={''}
                />
              </InputGroup>

              <InputGroup className="inputpw1">
                <label>현재 비밀번호</label>
                <Form.Control ref={passwordRef} type="password" placeholder="비밀번호" defaultValue={''} />
              </InputGroup>

              <InputGroup className="inputpw2">
                <label>새 비밀번호</label>
                <Form.Control
                  ref={newPasswordRef}
                  type="password"
                  placeholder="새 비밀번호"
                  defaultValue={''}
                  onChange={onPasswordChange}
                />
                <Form.Control
                  ref={newPasswordConfirmRef}
                  type="password"
                  placeholder="새 비밀번호 확인"
                  defaultValue={''}
                  onChange={onPasswordConfirmChange}
                />
              </InputGroup>
              {auth['new_password'] ? (
                auth['new_password_confirm'] ? (
                  <span className="inform inform1"></span>
                ) : (
                  <span className="inform inform1 red">비밀번호 확인 문자가 다릅니다.</span>
                )
              ) : auth['new_password'] !== '' ? (
                <span className="inform inform1 red">8~16자 영문, 숫자, 특수문자를 사용하세요.</span>
              ) : (
                <span className="inform inform1"></span>
              )}

              <InputGroup className="inputemail">
                <label>이메일</label>
                <Form.Control
                  ref={emailRef}
                  type="text"
                  placeholder="이메일주소"
                  aria-label="email"
                  defaultValue={''}
                  onChange={onEmailChange}
                />
              </InputGroup>
              {auth['email'] ? (
                <br />
              ) : (
                <span className="inform inform5 red">‘@’ 를 포함한 이메일 주소를 정확히 입력해주세요.</span>
              )}
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
                disabled={!modifyButtonOn}
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

const GradeItem = React.memo(({ index, account_data, grade_data, onClick }) => {
  return (
    <div className="innerbox">
      <dl>
        <dt>{grade_data.name}</dt>
        {grade_data.price != 0 && <dd>{grade_data.price}원</dd>}
        <dd>{grade_data.descript}</dd>
      </dl>

      <ul>{grade_data.functions && grade_data.functions.map((data, index) => <li>{data.name}</li>)}</ul>
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
      {account_data &&
      account_data.remain_warranty_day &&
      account_data.remain_warranty_day > 0 &&
      account_data.grade === grade_data.grade ? (
        <Button
          className="btn-primary"
          onClick={() => {
            onClick(grade_data, account_data);
          }}
        >
          사용중
        </Button>
      ) : (
        <Button
          onClick={() => {
            onClick(grade_data, account_data);
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
  const [checked, setChecked] = useState(false);
  const withDrawalIDRef = useRef(null);
  const withDrawalPasswordRef = useRef(null);

  const onClose = () => {
    setModalState(false);
  };

  const onClickWithdrawal = (e) => {
    e.preventDefault();
    const id = withDrawalIDRef.current.value;
    const password = withDrawalPasswordRef.current.value;

    if (!id || !password || account.id != id) {
      modal.alert('올바른 정보를 입력해주세요.');
      return;
    }

    request
      .post('user/membership/withdrawal', { access_token: account.access_token, agreement: checked, id, password })
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
            <Form.Control ref={withDrawalIDRef} type="text" placeholder="아이디" defaultValue={''} />
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
