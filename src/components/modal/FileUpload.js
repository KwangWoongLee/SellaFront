import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, ProgressBar } from 'react-bootstrap';
import Recoils from 'recoils';
import { logger, modal } from 'util/com';
import 'styles/Modal.scss';
import request from 'util/request';
import _ from 'lodash';

const FileUpload = () => {
  const state = Recoils.useValue('MODAL:FILEUPLOAD');
  const state_reset = Recoils.useResetState('MODAL:FILEUPLOAD');
  const [progress, setProgress] = useState({ percent: 0, loaded: 0, total: 0 });
  const [btn_disable, setBtnDisable] = useState(false);

  logger.render('FileUploadModal : ', state.show);

  useEffect(() => {
    if (!state.show) {
      setProgress(() => ({ percent: 0, loaded: 0, total: 0 }));
      setBtnDisable(false);
    }
  }, [state]);

  const onUploadProgress = (e) => {
    const percent = Math.round((e.loaded * 100) / e.total);

    logger.info(`${percent}% ... ${e.loaded} / ${e.total}`);

    setProgress({ percent, loaded: e.loaded, total: e.total });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const frm = new FormData();
    const files = e.currentTarget[0].files;

    _.forEach(files, (file) => frm.append('files', file));
    _.forEach(state.frm_data, (data, name) => frm.append(name, data));

    setProgress(() => ({ percent: 0, loaded: 0, total: 0 }));
    setBtnDisable(true);
    if (state.url) {
      request.post_form(state.url, frm, onUploadProgress).then((ret) => {
        if (!ret.err) {
          if (typeof ret.data === 'string') modal.alert('info', '업료드 완료', ret.data);
          else modal.alert('info', '업료드 완료', '요청하신 파일에 대한 읽기를 완료했습니다.');

          if (state.cb) state.cb(ret);
        }
        setBtnDisable(false);
      });
    } else {
      if (state.cb) state.cb({ err: null, files });
      state_reset();
    }
  };

  return (
    <Modal show={state.show} onHide={state_reset} size="lg" backdrop="static" centered>
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary">{state.title ? state.title : '파일 업로드'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit} id="upload-modal-form">
          <Form.Group className="mb-1">
            <Form.Label>{state.label}</Form.Label>
            <Form.Control type="file" accept={state.accept} multiple={state.multiple} />
          </Form.Group>
        </Form>
        <ProgressBar
          animated
          now={progress.percent}
          label={`${progress.percent}% ... ${progress.loaded} / ${progress.total}`}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="upload-modal-form" disabled={btn_disable}>
          보내기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(FileUpload);
