import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { logger } from 'util/com';

import 'styles/Modal.scss';

const ConfirmModal = () => {
  const [state, setState] = Recoils.useState('CONFIRM');
  logger.render('ConfirmModal : ', state.show);

  const onClose = () => {};

  // 클라이언트 쪽에서 처리되는 에러입니다.
  return (
    <Modal show={state.show} onHide={onClose} centered className="Confirm">
      {state.title && <span>{state.title}</span>}
      <br />
      {state.body &&
        state.body.map((l, key) => {
          <>
            *<span>{l.strong}</span>
            <span>{l.normal}</span>
          </>;
        })}
      <br />
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
    </Modal>
  );
};

export default React.memo(ConfirmModal);
