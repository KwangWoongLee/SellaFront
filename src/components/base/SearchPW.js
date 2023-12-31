import React, { useRef, useEffect, useState } from 'react';
import { Button, ButtonGroup, InputGroup, Form, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
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
import { RequestCert } from 'util/certification';

import 'styles/Login.scss';
import AgreementModal from 'components/common/AgreementModal';

const SearchPW = () => {
  //logger.debug('SearchPW');

  const [agreementModal, setAgreementModal] = useState(false);
  const [agreementModalContent, setAgreementModalContent] = useState([]);
  const [searchButtonOn, setSearchButtonOn] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [auth, setAuth] = useState({
    id: false,
    all_checked: false,
  });

  const idRef = useRef(null);

  useEffect(() => {
    if (!agreement.length) {
      request.post('base/info/agreement', {}).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('SELLA:AGREEMENT', data.sella_agreement);

          const agreement_temp = _.filter(_.cloneDeep(data.sella_agreement), { type: 'search' });
          _.forEach(agreement_temp, (item) => {
            item.checked = false;
          });

          setAgreement(agreement_temp);
        }
      });
    }
  }, []);

  useEffect(() => {
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

  const checkedItemHandler = (d) => {
    const obj = _.find(agreement, { group_id: d.group_id });
    obj.checked = !obj.checked;
    if (obj.checked === false) setAllChecked(false);

    setAgreement([...agreement]);
  };

  const onAllAgreementChange = () => {
    for (const agreement_item of agreement) {
      agreement_item.checked = !allChecked;
    }

    setAgreement([...agreement]);
    setAllChecked(!allChecked);
  };

  const onIDChange = (e) => {
    let id = idRef.current.value;
    if (id.length > 0) {
      const auth_temp = auth;
      auth_temp['id'] = true;
      setAuth({ ...auth_temp });
    } else {
      const auth_temp = auth;
      auth_temp['id'] = false;
      setAuth({ ...auth_temp });
    }
  };

  const onClickAgreement = (e, contents) => {
    setAgreementModalContent([...contents]);
    setAgreementModal(true);
  };

  return (
    <>
      <Head />
      <Body title={`비밀번호 찾기`} myClass={'searchpw'}>
        <Form id="search-form" className="formbox">
          <h3>비밀번호 찾기</h3>

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
                      {agreement[key].group_title}{' '}
                      <span onClick={(e) => onClickAgreement(e, agreement[key].contents)}>
                        <strong style={{ textDecoration: 'underline' }}>보기</strong>
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
          <InputGroup className="inputid">
            <label>아이디</label>
            <Form.Control ref={idRef} type="text" placeholder="아이디 입력" defaultValue={''} onChange={onIDChange} />
          </InputGroup>

          <Button
            onClick={() => {
              Recoils.setState('CONFIG:CERT', {
                random_key: '',
                name: '',
                temp_id: idRef.current.value,
              });

              const redirect_url = '/search/password/result';
              RequestCert(redirect_url, (data) => {
                if (data) {
                  const origin_cert = Recoils.getState('CONFIG:CERT');
                  Recoils.setState('CONFIG:CERT', {
                    ...origin_cert,
                    ...data,
                  });

                  navigate(redirect_url);
                } else modal.alert('인증에 실패하였습니다.');
              });
            }}
            disabled={!searchButtonOn}
            variant="primary"
            className="btn_blue btn_submit"
          >
            휴대폰 본인인증
          </Button>
        </Form>
      </Body>
      <Footer />

      <AgreementModal
        modalState={agreementModal}
        setModalState={setAgreementModal}
        contents={agreementModalContent}
      ></AgreementModal>
    </>
  );
};

export default React.memo(SearchPW);
