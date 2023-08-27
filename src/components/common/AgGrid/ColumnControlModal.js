import React, { useState, useEffect } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import Checkbox from 'components/common/CheckBoxCell';

import { img_src, logger } from 'util/com';

import 'styles/ColumnControlModal.scss';

import icon_close from 'images/icon_close.svg';

const ColumnControlModal = React.memo(
  ({ modalState, setModalState, callback, platform, viewColumns, setViewColumns }) => {
    logger.render('ColumnControlModal');
    let forms_idx;
    if (platform) {
      forms_idx = platform.idx;
    }

    const checkedItemHandler = (d) => {
      const obj = _.find(viewColumns, { sella_code: d.sella_code });
      obj.view = !d.view;

      setViewColumns([...viewColumns]);
    };

    const onSave = (e) => {
      e.preventDefault();

      if (forms_idx)
        request.post(`user/forms/array/save`, { forms_idx, viewColumns }).then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            logger.info(data);

            callback(data, viewColumns);
            onClose();
          }
        });
    };

    const onClose = () => setModalState(false);

    return (
      <Modal show={modalState} onHide={onClose} centered className="modal columnControlModal">
        <Modal.Header>
          <Modal.Title>
            조회 항목 관리
            <span className="sub">테이블에 표시될 항목을 체크해주세요.</span>
          </Modal.Title>
          <Button variant="primary" className="btn_close" onClick={onClose}>
            <img src={`${img_src}${icon_close}`} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <table className="columncontrol tbody">
            <tbody>
              <>
                {viewColumns &&
                  viewColumns.map((d, key) => (
                    <Column key={key} index={key} d={d} checkedItemHandler={checkedItemHandler} />
                  ))}
              </>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" form="column-form" onClick={onSave}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
);

const Column = React.memo(({ index, d, checkedItemHandler }) => {
  logger.render('Column : ', index);
  return (
    <tr>
      <td>{d.sella_title}</td>
      <td>
        <Checkbox
          checked={d.view}
          checkedItemHandler={() => {
            checkedItemHandler(d);
          }}
        ></Checkbox>
      </td>
    </tr>
  );
});

export default React.memo(ColumnControlModal);
