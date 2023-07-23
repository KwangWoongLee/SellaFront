import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const SearchModal = React.memo(({ modalState, setModalState, selectCallback, name }) => {
  logger.render('SearchModal');

  const nameRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([...Recoils.getState('DATA:GOODS')]);
  }, []);

  useEffect(() => {
    if (nameRef && nameRef.current && name) nameRef.current.value = name;
    onSearch();
  }, [name]);

  const onSearch = () => {
    if (!nameRef || !nameRef.current) return;

    const name = nameRef.current.value;

    const search_results = _.filter([...Recoils.getState('DATA:GOODS')], (goods) => {
      return _.includes(goods.name, name);
    });

    setItems(search_results);
  };

  const onSelect = (e, d) => {
    e.preventDefault();
    selectCallback(d);
    onClose();
  };
  const onClose = () => setModalState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal step2">
      <Modal.Header>
        <Modal.Title>상품선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input type="text" ref={nameRef} onKeyDown={handleKeyDown}></input>
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
