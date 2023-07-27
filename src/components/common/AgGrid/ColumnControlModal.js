import React, { useState, useEffect } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import Checkbox from 'components/common/CheckBoxCell';

import { logger } from 'util/com';

const ColumnControlModal = React.memo(({ modalState, setModalState, callback, viewColumns }) => {
  logger.render('ColumnControlModal');

  const [columns, setColumns] = useState([]);
  useEffect(() => {
    if (viewColumns) setColumns([...viewColumns]);
  }, [viewColumns]);

  const checkedItemHandler = (d) => {
    const obj = _.find(viewColumns, { idx: d.idx });
    obj.select_flag = !d.select_flag;

    setColumns([...viewColumns]);
  };

  const onSave = (e) => {
    e.preventDefault();

    request.post(`user/route_no/save`, { route_no: 0, viewColumns }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        callback(viewColumns);
        onClose();
      }
    });
  };

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal step2">
      <Modal.Header>
        <Modal.Title>조회 항목 관리</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table className="columncontrol thead">
          <thead></thead>
        </table>
        <table className="columncontrol tbody">
          <tbody>
            <>
              {columns &&
                columns.map((d, key) => <Column key={key} index={key} d={d} checkedItemHandler={checkedItemHandler} />)}
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
});

const Column = React.memo(({ index, d, checkedItemHandler }) => {
  logger.render('Column : ', index);
  return (
    <tr>
      <td>{d.headerName}</td>
      <Checkbox
        checked={d.select_flag}
        checkedItemHandler={() => {
          checkedItemHandler(d);
        }}
      ></Checkbox>
    </tr>
  );
});

export default React.memo(ColumnControlModal);
