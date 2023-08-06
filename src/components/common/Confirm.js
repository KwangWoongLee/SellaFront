import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { img_src, logger } from 'util/com';

import 'styles/Modal.scss';

import icon_close from 'images/icon_close.svg';

const ConfirmModal = () => {
  const [state, setState] = Recoils.useState('CONFIRM');
  logger.render('ConfirmModal : ', state.show);

  const onClose = () => {};

  // 클라이언트 쪽에서 처리되는 에러입니다.
  return (
    <Modal show={state.show} onHide={onClose} centered className="Confirm">
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary"></Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        {state.title && <span>{state.title}</span>}
        <br />
        {state.body &&
          state.body.map((l, key) => {
            <>
              *<span>{l.strong}</span>
              <span>{l.normal}</span>
            </>;
          })}
      </Modal.Body>
      <Modal.Footer>
        {state.buttons &&
          state.buttons.map((l, key) => (
            <Button
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
