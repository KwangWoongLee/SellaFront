import React, { useRef, useEffect, useState } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';
import Recoils from 'recoils';
import com, {
  modal,
  logger,
  navigate,
  replace_day,
  replace_year,
  replace_phone,
  is_regex_phone,
  is_regex_year,
  is_regex_day,
} from 'util/com';
import request from 'util/request';
import _ from 'lodash';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';

import 'styles/Login.scss';
import AgreementModal from 'components/common/AgreementModal';

const agency_str = ['통신사 선택', 'SKT', 'KT', 'LG'];
const month_str = ['월', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const gender = ['남', '여'];
const local = ['내국인', '외국인'];

const SearchID = () => {
  logger.render('SearchID');

  const [agreementModal, setAgreementModal] = useState(false);
  const [agreementModalContent, setAgreementModalContent] = useState('');
  const [searchButtonOn, setSearchButtonOn] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [agencyType, setAgencyType] = useState(0);
  const [monthType, setMonthType] = useState(0);
  const [genderType, setGenderType] = useState(0);
  const [localType, setLocalType] = useState(0);
  const [auth, setAuth] = useState({
    name: false,
    all_checked: false,
    phone: false,
    send_phone: false,
    auth_phone: false,
    year: false,
    month: false,
    day: false,
    agency: false,
  });

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const authNoRef = useRef(null);
  const yearRef = useRef(null);
  const dayRef = useRef(null);
  useEffect(() => {
    if (!agreement.length) {
      request.post('base/info/agreement', {}).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('SELLA:AGREEMENT', data.sella_agreement);

          const agreement_temp = _.filter(_.cloneDeep(Recoils.getState('SELLA:AGREEMENT')), { type: 'search' });
          _.forEach(agreement_temp, (item) => {
            item.checked = false;
          });

          setAgreement(agreement_temp);
        }
      });
    }

    if (allChecked && _.find(allChecked, { check: true })) setAllChecked(false);
  }, [agreement]);

  useEffect(() => {
    if (allChecked) {
      const auth_temp = auth;
      auth_temp['all_checked'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['all_checked'] = false;
      setAuth({ ...auth_temp });
    }
  }, [allChecked]);

  useEffect(() => {
    let isOk = true;
    for (const key in auth) {
      if (auth[key] == false) {
        isOk = false;
        break;
      }
    }

    if (isOk) setSearchButtonOn(true);
    else setSearchButtonOn(false);
  }, [auth]);

  useEffect(() => {
    if (agencyType) {
      const auth_temp = auth;
      auth_temp['agency'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['agency'] = false;
      setAuth({ ...auth_temp });
    }
  }, [agencyType]);

  useEffect(() => {
    if (monthType) {
      const auth_temp = auth;
      auth_temp['month'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['month'] = false;
      setAuth({ ...auth_temp });
    }
  }, [monthType]);

  const onSubmit = (e) => {
    e.preventDefault();

    for (const agreement_item of agreement) {
      if (agreement_item.essential_flag && !agreement_item.checked) {
        modal.alert('필수 동의 항목에 체크 해주세요.');
        return;
      }
    }

    const name = nameRef.current.value;
    const agency = agencyType;
    const gender = genderType;
    const local = localType;
    const phone = phoneRef.current.value;

    request.post('auth/search/id', { phone, name, gender, agency, local, agreement }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        com.storage.setItem('tempSearchIdResult', data.email);

        navigate('/search/id/result');
      }
    });
  };

  const checkedItemHandler = (d) => {
    const obj = _.find(agreement, { code: d.code });
    obj.checked = !obj.checked;
    if (obj.checked == false) setAllChecked(false);

    setAgreement([...agreement]);
  };

  const onAllAgreementChange = () => {
    for (const agreement_item of agreement) {
      agreement_item.checked = !allChecked;
    }

    setAgreement([...agreement]);
    setAllChecked(!allChecked);
  };

  const onNameChange = (e) => {
    let name = nameRef.current.value;
    if (name.length > 0) {
      const auth_temp = auth;
      auth_temp['name'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['name'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onYearChange = (e) => {
    let year = yearRef.current.value;
    if (year.length > 4) {
      yearRef.current.value = year.substr(0, 4);
      return;
    }
    year = replace_year(year);

    yearRef.current.value = year;
    if (is_regex_year(year)) {
      const auth_temp = auth;
      auth_temp['year'] = year;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['year'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onDayChange = (e) => {
    let day = dayRef.current.value;
    if (day.length > 2) {
      dayRef.current.value = day.substr(0, 2);
      return;
    }
    day = replace_day(day);

    dayRef.current.value = day;
    if (is_regex_day(day)) {
      const auth_temp = auth;
      auth_temp['day'] = day;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['day'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onPhoneChange = (e) => {
    let phone = phoneRef.current.value;
    if (phone.length > 13) {
      phoneRef.current.value = phone.substr(0, 13);
      return;
    }
    phone = replace_phone(phone);

    phoneRef.current.value = phone;
    if (is_regex_phone(phone)) {
      const auth_temp = auth;
      auth_temp['phone'] = phone;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['phone'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onAuthNoChange = (e) => {
    let auth_no = authNoRef.current.value;
    if (auth_no.length > 6) {
      authNoRef.current.value = auth_no.substr(0, 6);
      return;
    }
  };

  const onClickAgreement = (e, content) => {
    setAgreementModalContent(content);
    setAgreementModal(true);
  };

  const onCheckPhoneAuthNo = (e) => {
    const phone = phoneRef.current.value;
    const auth_no = authNoRef.current.value;
    if (auth_no)
      request.post('auth/phone/auth_no', { phone, auth_no }).then((ret) => {
        if (!ret.err) {
          const auth_temp = auth;
          auth_temp['auth_phone'] = true;
          setAuth({ ...auth_temp });
        }
      });
  };

  const onSendPhoneAuthNo = (e) => {
    const phone = phoneRef.current.value;

    request.post('auth/phone', { phone }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        modal.alert(`임시방편입니다.
          ${data.random_no}
        `);

        const auth_temp = auth;
        auth_temp['send_phone'] = true;
        setAuth({ ...auth_temp });
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`아이디 찾기`} myClass={'searchid'}>
        <Form onSubmit={onSubmit} id="search-id-form" className="formbox">
          <h3>아이디 찾기</h3>

          <div className="termsbox">
            <div className="terms">
              <Checkbox
                checked={allChecked}
                checkedItemHandler={() => {
                  onAllAgreementChange();
                }}
              ></Checkbox>
              <label>아래 약관에 모두 동의합니다.</label>
            </div>
            <ul className="terms">
              {agreement.map((name, key) => (
                <>
                  <li>
                    <Checkbox
                      checked={agreement[key].checked}
                      checkedItemHandler={() => {
                        checkedItemHandler(agreement[key]);
                      }}
                    ></Checkbox>
                    <label>
                      {agreement[key].title}{' '}
                      <span onClick={(e) => onClickAgreement(e, agreement[key].content)}>
                        <strong
                          style={{
                            textDecoration: 'underline',
                          }}
                        >
                          보기
                        </strong>
                      </span>
                    </label>
                  </li>
                </>
              ))}
            </ul>
          </div>
          {!auth['all_checked'] ? (
            <span className="inform inform1 red">개인정보처리에 대한 동의가 필요합니다.</span>
          ) : (
            <br />
          )}

          <label>이름</label>
          <InputGroup className="inputname">
            <Form.Control ref={nameRef} type="text" placeholder="이름 입력" defaultValue={''} onChange={onNameChange} />
          </InputGroup>

          <label>휴대폰 인증</label>
          <InputGroup className="inputphone1">
            <Form.Control type="text" placeholder="생년월일" defaultValue={''} disabled />
            <Form.Control ref={yearRef} type="text" placeholder="년(4자)" defaultValue={''} onChange={onYearChange} />
            <DropdownButton variant="" title={month_str[monthType]} className="inputmonth">
              {month_str.map((name, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setMonthType(key);
                  }}
                  active={monthType === key}
                >
                  {month_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Form.Control ref={dayRef} type="text" placeholder="일" defaultValue={''} onChange={onDayChange} />
          </InputGroup>
          <div className="btnbox">
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
            <Form.Control
              ref={phoneRef}
              type="text"
              placeholder="휴대폰 번호 입력"
              defaultValue={''}
              onChange={onPhoneChange}
            />
            <Button
              disabled={
                !(auth['name'] && auth['year'] && auth['day'] && auth['agency'] && auth['month'] && auth['phone'])
              }
              variant="primary"
              className="btn_blue"
              onClick={onSendPhoneAuthNo}
            >
              인증번호 발송
            </Button>
          </InputGroup>
          {auth['send_phone'] ? (
            <span className="inform inform1">인증번호를 발송했습니다.</span>
          ) : auth['phone'] ? (
            <span className="inform inform1 red">인증번호를 발송하세요.</span>
          ) : (
            <br />
          )}
          <InputGroup className="inputphone2">
            <Form.Control
              ref={authNoRef}
              type="text"
              placeholder="인증번호 입력"
              defaultValue={''}
              onChange={onAuthNoChange}
            />
            <Button disabled={!auth['send_phone']} variant="primary" className="btn_blue" onClick={onCheckPhoneAuthNo}>
              인증하기
            </Button>
            {auth['auth_phone'] ? (
              <span className="inform inform1">인증되었습니다.</span>
            ) : auth['send_phone'] ? (
              <span className="inform inform2 red">인증번호가 일치하지 않습니다.</span>
            ) : (
              <br />
            )}
          </InputGroup>
          <Button
            disabled={!searchButtonOn}
            variant="primary"
            type="submit"
            form="search-id-form"
            className="btn_blue btn_submit"
          >
            확인
          </Button>
        </Form>
      </Body>
      <Footer />

      <AgreementModal
        modalState={agreementModal}
        setModalState={setAgreementModal}
        content={agreementModalContent}
      ></AgreementModal>
    </>
  );
};

export default React.memo(SearchID);
