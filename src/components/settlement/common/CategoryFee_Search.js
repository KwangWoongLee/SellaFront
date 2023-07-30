import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const CategoryFee_Search = React.memo(({ abledCategoryFee, selectCallback }) => {
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
    selectCallback(d);
  };

  const onChange = (key, e) => {
    setPlatformType(key);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <>
      <div className="inputbox">
        <DropdownButton variant="" title={platform_str[platformType]}>
          {platform_str.map((name, key) => (
            <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={platformType === key}>
              {platform_str[key]}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <input
          type="text"
          placeholder="카테고리명"
          ref={categoryRef}
          onKeyDown={handleKeyDown}
          className="input_search"
        ></input>
        <Button onClick={onSearch} className="btn_search">
          <img src={`/${icon_search}`} />
        </Button>
        <Button className="btn_reset">
          <img src={`/${icon_reset}`} />
        </Button>
      </div>
      <div className="categoryfeesearch">
        <table>
          <tbody>
            {abledCategoryFee ? (
              <>{items && items.map((d, key) => <SelectItem key={key} index={key} d={d} onSelect={onSelect} />)}</>
            ) : (
              <>이 매체는 수수료 매칭이 필요하지 않습니다.</>
            )}
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

export default React.memo(CategoryFee_Search);
