import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const StandardProduct_Search = React.memo(({ selectCallback, unSelectCallback, parentFormsMatchSelectData }) => {
  logger.render('StandardProduct_Search');

  const goodsNameRef = useRef(null);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    if (!parentFormsMatchSelectData) {
      return;
    } else {
      const forms_match = parentFormsMatchSelectData;
      if (forms_match) {
        if (forms_match.goods_match.length == 0) {
          setMode(1);
        } else {
          onSearch();
          setMode(2);
        }
      }
    }
  }, [parentFormsMatchSelectData]);

  useEffect(() => {
    //연결된 기준상품
    let goods_matchs = [...items];

    //추천 상품
    let recommands = _.cloneDeep(
      _.filter(Recoils.getState('DATA:GOODS'), (goods) => {
        return _.includes(goods_matchs, goods.name);
      })
    );

    const viewItems = [...goods_matchs, ...recommands];
    // if (viewItems && viewItems.length) {
    //   if (mode != 2) {
    //     setMode(2);
    //   }
    // } else {
    //   if (!_.includes(rows, (row) => row.select)) {
    //     return;
    //   }

    //   setMode(1);
    // }
  }, [items]);

  const onSearch = () => {
    let search_results = _.cloneDeep(Recoils.getState('DATA:GOODS'));
    const forms_match = parentFormsMatchSelectData;

    const goodsName = goodsNameRef.current.value;
    if (goodsName) {
      search_results = _.filter(search_results, (goods) => {
        return _.includes(goods.name, goodsName);
      });
    }

    const goods_match_names = _.map(forms_match.goods_match, 'name');

    for (const search_result of search_results) {
      if (_.includes(goods_match_names, search_result.name)) {
        search_result.select = true;
      } else {
        search_result.select = false;
      }
    }

    setItems(search_results);
    setMode(2);
  };

  const onSelect = (e, d) => {
    e.preventDefault();

    selectCallback(d);
    onSearch();
  };

  const onUnSelect = (e, d) => {
    e.preventDefault();

    unSelectCallback(d);
    onSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  const onReset = () => {
    goodsNameRef.current.value = '';
    onSearch();
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
          <img src={`${img_src}${icon_search}`} />
        </Button>
        <Button className="btn_reset" onClick={onReset}>
          <img src={`${img_src}${icon_reset}`} />
        </Button>
      </div>
      <div className="standardproductsearch">
        <table>
          <tbody>
            <>
              {mode == 0 && '판매상품 연결 조회 상품을 선택해 주세요.'}
              {mode == 1 && 'step1. 상품명으로 검색하세요.'}
              {mode == 2 &&
                items &&
                items.map((d, key) => (
                  <StandardProductItem key={key} index={key} d={d} onSelect={onSelect} onUnSelect={onUnSelect} />
                ))}
            </>
          </tbody>
        </table>
      </div>
    </>
  );
});

const StandardProductItem = React.memo(({ index, d, onSelect, onUnSelect }) => {
  logger.render('StandardProductItem : ', index);
  return (
    <tr
      onDoubleClick={(e) => {
        if (d.select) {
          onUnSelect(e, d);
          return;
        }

        onSelect(e, d);
      }}
    >
      <td>{d.name}</td>
      <td className="td_small">
        {d.select ? (
          <button
            className="btn-primary btn_blue btn_small"
            onClick={(e) => {
              onUnSelect(e, d);
            }}
          >
            해제
          </button>
        ) : (
          <>
            <button
              className="btn-primary btn_blue btn_small"
              onClick={(e) => {
                onSelect(e, d);
              }}
            >
              선택
            </button>
          </>
        )}
      </td>
    </tr>
  );
});

export default React.memo(StandardProduct_Search);
