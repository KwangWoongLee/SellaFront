import React, { useRef, useEffect, useState } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { modal, logger, navigate } from 'util/com';
import request from 'util/request';
import _ from 'lodash';

import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import Checkbox from 'components/common/CheckBoxCell';

import AgreementModal from 'components/common/AgreementModal';
import { RequestCert } from 'util/certification';

import 'styles/Login.scss';

const SearchID = () => {
  //logger.debug('SearchID');

  const [agreementModal, setAgreementModal] = useState(false);
  const [agreementModalContent, setAgreementModalContent] = useState([]);
  const [searchButtonOn, setSearchButtonOn] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [agreement, setAgreement] = useState([]);
  const [auth, setAuth] = useState({
    all_checked: false,
  });

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

    if (allChecked && _.find(allChecked, { check: true })) setAllChecked(false);
  }, []);

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

  const onClickAgreement = (e, contents) => {
    setAgreementModalContent([...contents]);
    setAgreementModal(true);
  };

  return (
    <>
      <Head_NoLogin />
      <Body title={`아이디 찾기`} myClass={'searchid'}>
        <Form id="search-id-form" className="formbox">
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
                      {agreement[key].group_title}{' '}
                      <span onClick={(e) => onClickAgreement(e, agreement[key].contents)}>
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
          <Button
            disabled={!searchButtonOn}
            variant="primary"
            className="btn_blue btn_submit"
            onClick={() => {
              const redirect_url = '/search/id/result';
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

export default React.memo(SearchID);
