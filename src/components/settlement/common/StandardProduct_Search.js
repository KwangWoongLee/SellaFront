import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <>
      <div class="inputbox">
        <input
          type="text"
          placeholder={'상품명'}
          ref={goodsNameRef}
          onKeyDown={handleKeyDown}
          className="input_search"
        ></input>
        <Button onClick={onSearch} className="btn_search">
          <img src={icon_search} />
        </Button>
        <Button className="btn_reset">
          <img src={icon_reset} />
        </Button>
      </div>
      <div className="standardproductsearch">
        <table>
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
      <td className="td_small">
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

export default React.memo(StandardProduct_Search);
