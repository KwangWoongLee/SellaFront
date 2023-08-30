import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { return_newline_render, img_src, logger } from 'util/com';

import 'styles/Modal.scss';

import icon_close from 'images/icon_close.svg';

const ConfirmModal = () => {
  const [state, setState] = Recoils.useState('CONFIRM');
  logger.render('ConfirmModal : ', state.show);

  const onClose = () => {
    setState({ show: false });
  };

  // 클라이언트 쪽에서 처리되는 에러입니다.
  return (
    <Modal show={state.show} onHide={onClose} centered className="Confirm">
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary"></Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img src={`${img_src}${icon_close}`} />
        </Button>
        {state.title && <span className="css-fix-line">{state.title}</span>}
      </Modal.Header>
      {/*요 안에 형식은 주희님 편하신대로! 
      현재는 strong : 진한글자 , normal : 일반글자
      다만 여기는 alert 제외한 모든 confirm 모달의 요구사항이 포함되어야 하니
      원하는 디자인 말씀해주시면! 넣도록 할게요!
      */}
      <Modal.Body>
        {state.body &&
          state.body.map((l, key) => (
            <>
              <strong className="css-fix-line">{l.strong}</strong>
              <span className="css-fix-line">{l.normal}</span>
            </>
          ))}
      </Modal.Body>
      <Modal.Footer>
        {state.buttons &&
          state.buttons.map((l, key) => (
            <Button
              className={l.className ? l.className : ''}
              onClick={() => {
                l.callback();
                setState({ show: false });
              }}
            >
              {l.name}
            </Button>
          ))}
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(ConfirmModal);
