import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { logger } from 'util/com';

import 'styles/Modal.scss';

const AlertModal = () => {
  const [state, setState] = Recoils.useState('ALERT');
  logger.render('AlertModal : ', state.show);

  const onClose = () => {};

  // 서버에서 응답한 에러입니다. 확인 버튼 이외 불가능
  // 여기 에러메시지는 서버에서 보낸
  return (
    <Modal show={state.show} onHide={onClose} centered className="Alert">
      {state.error && <span>{state.error}</span>}
      <Button
        onClick={() => {
          setState({ show: false });
        }}
      >
        확인
      </Button>
    </Modal>
  );
};

export default React.memo(AlertModal);
