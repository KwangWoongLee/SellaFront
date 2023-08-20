import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, InputGroup, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal, page_reload } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_close from 'images/icon_close.svg';

const AgreementModal = React.memo(({ modalState, setModalState, content }) => {
  logger.render('AgreementModal');

  const onClose = () => {
    // setModalState(false)
  };

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Body>{content}</Modal.Body>
    </Modal>
  );
});

export default React.memo(AgreementModal);
