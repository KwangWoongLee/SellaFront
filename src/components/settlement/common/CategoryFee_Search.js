import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const CategoryFee_Search = React.memo(({ callback }) => {
  logger.render('CategoryFee_Search');
  const sella_categories = Recoils.useValue('SELLA:CATEGORIES');

  const categoryRef = useRef(null);
  const [items, setItems] = useState([]);
  const [platformType, setPlatformType] = useState(0);
  const platform_str = _.uniq(_.map(sella_categories, 'name'));

  useEffect(() => {
    setItems([...sella_categories]);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();

    let search_results = [...sella_categories];
    if (platform_str[platformType]) {
      search_results = _.filter(search_results, (category) => {
        return _.includes(category.name, platform_str[platformType]);
      });
    }

    const categoryName = categoryRef.current.value;
    if (categoryName) {
      search_results = _.filter(search_results, (category) => {
        return _.includes(category.category, categoryName);
      });
    }

    setItems(search_results);
  };

  const onSelect = (e, d) => {
    e.preventDefault();
    callback(d);
  };

  const onChange = (key, e) => {
    setPlatformType(key);
  };

  return (
    <>
      <div>
        수수료검색
        <DropdownButton variant="" title={platform_str[platformType]}>
          {platform_str.map((name, key) => (
            <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={platformType === key}>
              {platform_str[key]}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <input type="text" placeholder="카테고리명" ref={categoryRef}></input>
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
      <td>{d.category}</td>
      <td>{d.category_fee_rate}%</td>
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

export default React.memo(CategoryFee_Search);
