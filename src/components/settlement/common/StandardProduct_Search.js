import React, { useState, useEffect, useRef } from 'react';

import { Button } from 'react-bootstrap';
import { img_src } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const StandardProduct_Search = React.memo(({ selectCallback, unSelectCallback, parentFormsMatchSelectData }) => {
  //logger.debug('StandardProduct_Search');

  const goodsNameRef = useRef(null);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    if (!parentFormsMatchSelectData) {
      return;
    } else {
      const forms_match = parentFormsMatchSelectData;
      if (forms_match) {
        onSearch();
        setMode(2);
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

    if (!forms_match) {
      return;
    }

    const goodsName = _.lowerCase(goodsNameRef.current.value);
    if (goodsName) {
      search_results = _.filter(search_results, (goods) => {
        return _.includes(_.lowerCase(goods.name), _.lowerCase(goodsName));
      });
    }
    const goods_match_names = _.map(forms_match.goods_match, 'name');
    _.forEach(goods_match_names, (name) => _.lowerCase(name));

    for (const search_result of search_results) {
      if (_.includes(_.map(forms_match.goods_match, 'name'), search_result.name)) {
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
          <thead>
            <>
              <th>상품명</th>
              <th>입고단가</th>
              <th></th>
            </>
          </thead>
          <tbody>
            <>
              {mode == 0 && <td className="td_empty"></td>}
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
  //logger.debug('StandardProductItem : ', index);
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
      <td>{d.stock_price}</td>
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
