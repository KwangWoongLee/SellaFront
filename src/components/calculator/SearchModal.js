import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const SearchModal = React.memo(({ modalState, setModalState, goods_data, callback }) => {
  logger.render('SearchModal');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const nameRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onSearch = (e) => {
    e.preventDefault();

    const name = nameRef.current.value;

    if (!name) return modal.alert('error', '필수항목 누락', '상품명 항목이 비었습니다.');

    const search_results = _.filter(goods_data, (goods) => {
      return _.includes(goods.name, name);
    });

    setItems(search_results);
  };

  const onSelect = (e, d) => {
    e.preventDefault();
    callback(d);
    onClose();
  };
  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal step2">
      <Modal.Header>
        <Modal.Title>상품선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input type="text" ref={nameRef}></input>
        <Button onClick={onSearch}>찾기</Button>

        <table className="section">
          <tbody>
            <>{items && items.map((d, key) => <SelectItem key={key} index={key} d={d} onSelect={onSelect} />)}</>
          </tbody>
        </table>
      </Modal.Body>
    </Modal>
  );
});

const SelectItem = React.memo(({ index, d, onSelect }) => {
  logger.render('SelectItem : ', index);
  return (
    <tr>
      <td>{d.name}</td>
      <td>
        <button
          className="btn_del"
          onClick={(e) => {
            onSelect(e, d);
          }}
        >
          선택
        </button>
      </td>
    </tr>
  );
});

export default React.memo(SearchModal);
