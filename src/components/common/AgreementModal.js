import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, InputGroup, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal, page_reload } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_close from 'images/icon_close.svg';

const AgreementModal = React.memo(({ modalState, setModalState }) => {
  logger.render('AgreementModal');

  const onClose = () => setModalState({ state: false, content: '' });

  return (
    <Modal show={modalState.state} onHide={onClose} centered className="agreementmodal">
      <Modal.Body>{modalState.content}</Modal.Body>
    </Modal>
  );
});

export default React.memo(AgreementModal);
