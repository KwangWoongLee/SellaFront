import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Recoils from 'recoils';
import _ from 'lodash';

import { img_src, logger } from 'util/com';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const CategoryFee_Search = React.memo(({ selectCallback, parentFormsMatchSelectData }) => {
  logger.render('CategoryFee_Search');
  const sella_categories = Recoils.useValue('SELLA:CATEGORIES');

  const categoryRef = useRef(null);
  const [items, setItems] = useState([]);
  const [platformStr, setPlatformStr] = useState([]);
  const [platformType, setPlatformType] = useState(-1);
  let basic_platform_str = _.uniq(_.map(sella_categories, 'name'));
  const [mode, setMode] = useState(1);

  useEffect(() => {
    if (!parentFormsMatchSelectData) {
      setPlatformStr([]);
      return;
    } else {
      const forms_match = parentFormsMatchSelectData;
      if (forms_match) {
        let findFlag = false;

        if (forms_match.forms_name) {
          for (let i = 0; i < basic_platform_str.length; ++i) {
            const platformName = basic_platform_str[i];

            if (platformName === forms_match.forms_name) {
              setPlatformStr([...forms_match.forms_name]);
              setPlatformType(i);
              findFlag = true;
              break;
            }
          }
        }

        if (forms_match.settlement_flag) {
          setMode(1);
        } else {
          if (typeof forms_match.settlement_flag === 'undefined') return;

          if (!findFlag) {
            setPlatformStr([...basic_platform_str]);
            setPlatformType(0);
          }
          setMode(2);
        }
      }
    }
  }, [parentFormsMatchSelectData]);

  // useEffect(() => {
  //   let search_results = [...sella_categories];
  //   if (platformType != -1 && platform_str[platformType]) {
  //     search_results = _.filter(search_results, (category) => {
  //       return _.includes(category.name, platform_str[platformType]);
  //     });
  //   }

  //   setItems(search_results);
  // }, []);

  useEffect(() => {
    let search_results = [...sella_categories];
    if (platformType != -1 && basic_platform_str[platformType]) {
      search_results = _.filter(search_results, (category) => {
        return _.includes(category.name, basic_platform_str[platformType]);
      });
    }

    setItems(search_results);
  }, [platformType]);

  const onSearch = (e) => {
    e.preventDefault();

    let search_results = [...sella_categories];
    if (platformType != -1 && basic_platform_str[platformType]) {
      search_results = _.filter(search_results, (category) => {
        return _.includes(category.name, basic_platform_str[platformType]);
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

  const onReset = (e) => {
    e.preventDefault();
    categoryRef.current.value = '';
    setPlatformType(0);
  };

  return (
    <>
      <div className="inputbox">
        <DropdownButton variant="" title={platformStr[platformType]}>
          {platformStr.map((name, key) => (
            <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={platformType === key}>
              {platformStr[key]}
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
          <img src={`${img_src}${icon_search}`} />
        </Button>
        <Button className="btn_reset" onClick={onReset}>
          <img src={`${img_src}${icon_reset}`} />
        </Button>
      </div>
      <div className="categoryfeesearch">
        <table>
          <tbody>
            {mode == 1 && <>이 매체는 수수료 매칭이 필요하지 않습니다.</>}
            {mode == 2 && (
              <>{items && items.map((d, key) => <SelectItem key={key} index={key} d={d} onSelect={onSelect} />)}</>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
});

const SelectItem = React.memo(({ index, d, onSelect }) => {
  const category_fee_rate = d.category_fee_rate ? Number(d.category_fee_rate).toFixed(1) : '';
  return (
    <tr>
      <td>{d.category}</td>
      <td>{category_fee_rate}%</td>
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
