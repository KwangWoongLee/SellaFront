import React, { useEffect, useState } from 'react';
import { img_src, logger, navigate } from 'util/com';

import { Nav, Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import request from 'util/request';
import _ from 'lodash';

import logo_blue from 'images/logo_blue.svg';
import icon_close from 'images/icon_close.svg';
// import logo_footer from 'images/logo_footer.svg';

const Footer = () => {
  const [modalState, setModalState] = useState(false);
  const [content, setContent] = useState('');

  const onLink = (e, no_login_path) => {
    e.preventDefault();
    logger.debug('href : ', e.currentTarget.name);
    if (no_login_path) {
      navigate(no_login_path);
    } else {
      navigate(e.currentTarget.name);
    }

    //logger.debug('NavigateCtr :');
  };

  const onClickModal = (agreement_code) => {
    // 쓰레기코드 입니다. 반성합니다.
    let agreements = Recoils.getState('SELLA:AGREEMENT');
    if (!agreements.length) {
      request.post('base/info/agreement', {}).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('SELLA:AGREEMENT', data.sella_agreement);

          const findObj = _.find(data.sella_agreement, (obj) => {
            return _.find(obj.contents, { code: agreement_code });
          });
          setModalState(true);
          setContent(findObj.contents[0].content);
        }
      });
    } else {
      let agreements = Recoils.getState('SELLA:AGREEMENT');
      const findObj = _.find(agreements, (obj) => {
        return _.find(obj.contents, { code: agreement_code });
      });

      setModalState(true);
      setContent(findObj.contents[0].content);
    }
  };

  const onClose = () => setModalState(false);

  return (
    <>
      <div className="footer">
        <div className="menubox">
          <ul>
            <li>
              <Nav.Link onClick={() => onClickModal(1)} className="logo" name="/cscenter/announcement">
                개인정보처리방침
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={() => onClickModal(2)} className="logo" name="/cscenter/announcement">
                이용약관
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter/announcement">
                공지사항
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter">
                고객센터
              </Nav.Link>
            </li>
          </ul>
        </div>
        <div className="informbox">
          <img src={`${img_src}${logo_blue}`} alt="로고" />
          <dl>
            <dd>셀러라면</dd>
            <dd className="left">상담전화 : 070-8028-4426</dd>
            <dd>주소 : 경기도 양주시 부흥로 1936, 405호</dd>
            <dd className="left">대표 : 박효은</dd>
            <dd>개인정보책임자 : 이광웅(lgu4821@gmail.com)</dd>
            <dd className="left">사업자 등록번호 : 701-34-01219</dd>
            <dd>통신판매업신고 : 제 2023-경기양주-1712 호</dd>
            <dd>COPYRIGHT 2023 BY SELLA ALL RIGHTS RESERVED.</dd>
          </dl>
        </div>
      </div>

      <Modal show={modalState} onHide={onClose} centered className="modal">
        <Modal.Header>
          <Modal.Title>약관 보기</Modal.Title>
          <Button variant="primary" className="btn_close" onClick={onClose}>
            <img alt={''} src={`${img_src}${icon_close}`} />
          </Button>
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>
      </Modal>
    </>
  );
};

export default React.memo(Footer);
