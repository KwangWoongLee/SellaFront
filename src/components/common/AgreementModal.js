import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { img_src } from 'util/com';
import { logger } from 'util/com';
import { useState, useEffect } from 'react';
import _ from 'lodash';

import icon_close from 'images/icon_close.svg';

const AgreementModal = React.memo(({ modalState, setModalState, contents }) => {
  //logger.debug('AgreementModal');
  const [contentObj, setContentObj] = useState({ title: '', content: '' });
  const [selectButton, setSelectButton] = useState(0);

  useEffect(() => {
    if (contents && contents.length) {
      setContentObj(contents[0]);
    }
  }, [contents]);

  const onClose = () => {
    setModalState(false);
  };

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Header>
        {contents &&
          contents.map((d, idx) => (
            <>
              <Button
                className={selectButton === idx ? 'tab on' : 'tab'}
                onClick={() => {
                  setContentObj(d);
                  setSelectButton(idx);
                }}
              >
                {d.button_name}
              </Button>
            </>
          ))}
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img alt={''} src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <strong>{contentObj.title}</strong>
        {_.split(contentObj.content, '\n').map((d, key) => {
          return (
            <>
              {d}
              <br></br>
            </>
          );
        })}
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(AgreementModal);
