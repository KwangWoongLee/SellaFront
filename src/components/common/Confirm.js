import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { img_src, logger } from 'util/com';

import 'styles/Modal.scss';

import icon_close from 'images/icon_close.svg';

const ConfirmModal = () => {
  const [state, setState] = Recoils.useState('CONFIRM');
  //logger.debug('ConfirmModal : ', state.show);

  const onClose = () => {
    setState({ show: false });
  };

  // 클라이언트 쪽에서 처리되는 에러입니다.
  return (
    <Modal show={state.show} onHide={onClose} centered className="Confirm">
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary"></Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img alt={''} src={`${img_src}${icon_close}`} />
        </Button>
        {state.title && <span className="css-fix-line">{state.title}</span>}
      </Modal.Header>
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
