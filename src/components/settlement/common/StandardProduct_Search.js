import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const StandardProduct_Search = React.memo(({ rows, selectCallback }) => {
  logger.render('StandardProduct_Search');

  const goodsNameRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (rows && rows.length) {
      setItems([...rows]);
    } else {
      const goods = [...Recoils.getState('DATA:GOODS')];
      setItems(goods);
    }
  }, [rows]);

  const onSearch = (e) => {
    e.preventDefault();

    let search_results = [...Recoils.getState('DATA:GOODS')];

    const goodsName = goodsNameRef.current.value;
    if (goodsName) {
      search_results = _.filter(search_results, (goods) => {
        return _.includes(goods.name, goodsName);
      });
    }

    setItems(search_results);
  };

  const onSelect = (e, d) => {
    e.preventDefault();
    selectCallback(d);
  };

  return (
    <>
      <div>
        연결한 기준 상품 검색
        <input type="text" placeholder={'상품명'} ref={goodsNameRef}></input>
        <Button onClick={onSearch}>찾기</Button>
        <table className="section">
          <tbody>
            <>{items && items.map((d, key) => <SelectItem key={key} index={key} d={d} onSelect={onSelect} />)}</>
          </tbody>
        </table>
      </div>
    </>
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

export default React.memo(StandardProduct_Search);
