import React from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import Recoils from 'recoils';
import { logger, modal } from 'util/com';

import 'styles/Modal.scss';

const ConfirmModal = () => {
  const [state, setState] = Recoils.useState('CONFIRM');
  logger.render('ConfirmModal : ', state.show);

  const onClose = () => {
    setState({ show: false });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const ret = [];
    for (let i = 0; i < state.values.length; i++) {
      const { value } = e.currentTarget[i];
      if (value.length === 0) return modal.alert('error', '', `${state.values} 항목이 비었습니다.`);

      ret.push(value);
    }

    state.cb(ret);
    setState({ show: false });
  };

  return (
    <Modal show={state.show} onHide={onClose} centered className="Confirm">
      {state.title && (
        <Modal.Header>
          <Modal.Title className="text-primary">{state.title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>
        <Form onSubmit={onSubmit} id="confirm-modal-form">
          {state.values &&
            state.values.map((l, key) => (
              <FloatingLabel key={key} controlId={`floating-input-${key}`} label={l} className="mb-1">
                <Form.Control type="text" placeholder={String(key)} />
              </FloatingLabel>
            ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="confirm-modal-form">
          확인
        </Button>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(ConfirmModal);
