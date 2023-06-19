import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, InputGroup, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal, page_reload } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const ImageModal = React.memo(({ modalState, setModalState, imgUrl }) => {
  logger.render('Step2Modal');

  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Body>
        <img src={imgUrl} />
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(ImageModal);
