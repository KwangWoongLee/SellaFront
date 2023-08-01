import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, InputGroup, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal, page_reload } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_close from 'images/icon_close.svg';

const ImageModal = React.memo(({ modalState, setModalState, imgUrl }) => {
  logger.render('Step2Modal');

  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="imagemodal">
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary">이미지 보기</Modal.Title>
        <Button onClick={onClose} variant="primary" className="btn_close">
          <img src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>

      <Modal.Body>
        <img src={imgUrl} />
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(ImageModal);
