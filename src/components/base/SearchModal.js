import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_close from 'images/icon_close.svg';
import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

import 'styles/SearchModal.scss';

const SearchModal = React.memo(({ modalState, setModalState, selectCallback }) => {
  logger.render('SearchModal');

  const nameRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([...Recoils.getState('DATA:GOODS')]);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();

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
    <Modal show={modalState} onHide={onClose} centered className="modal searchmodal_calculator">
      <Modal.Header>
        <Modal.Title>상품선택</Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img alt={''} src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div class="inputbox">
          <input
            type="text"
            placeholder={'상품명'}
            ref={nameRef}
            onKeyDown={handleKeyDown}
            className="input_search"
          ></input>
          <Button onClick={onSearch} className="btn_search">
            <img alt={''} src={`${img_src}${icon_search}`} />
          </Button>
          <Button className="btn_reset">
            <img alt={''} src={`${img_src}${icon_reset}`} />
          </Button>
        </div>
        <div className="tablebox">
          <table>
            <tbody>
              <>{items && items.map((d, key) => <SelectItem key={key} index={key} d={d} onSelect={onSelect} />)}</>
            </tbody>
          </table>
        </div>
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
          className="btn-primary btn_blue btn_small"
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
