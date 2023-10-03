import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { img_src } from 'util/com';
import { logger } from 'util/com';

import icon_close from 'images/icon_close.svg';

const AgreementModal = React.memo(({ modalState, setModalState, content }) => {
  logger.render('AgreementModal');

  const onClose = () => {
    setModalState(false);
  };

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Header>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img alt={''} src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>{content}</Modal.Body>
    </Modal>
  );
});

export default React.memo(AgreementModal);
