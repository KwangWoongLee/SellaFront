import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recoils from 'recoils';
import { img_src, logger } from 'util/com';
import 'styles/Modal.scss';
import _ from 'lodash';

import icon_close from 'images/icon_close.svg';

const AlertModal = () => {
  const [state, setState] = Recoils.useState('ALERT');
  logger.render('AlertModal : ', state.show);

  const onClose = () => {
    setState(false);
  };

  // 서버에서 응답한 에러입니다. 확인 버튼 이외 불가능
  // 여기 에러메시지는 서버에서 보낸
  return (
    <Modal show={state.show} onHide={onClose} centered className="Alert">
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary"></Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        {state.error &&
          _.split(state.error, '\n').map((d, key) => {
            if (key == _.split(state.error, '\n').length - 1) return <>{d}</>;
            else
              return (
                <>
                  {d}
                  <br />
                </>
              );
          })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setState({ show: false });
          }}
        >
          확인
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(AlertModal);
