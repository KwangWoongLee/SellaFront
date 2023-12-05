import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import FormManagementNavTab from 'components/settlement/common/FormManagementNavTab';

import Recoils from 'recoils';
import { img_src, logger, time_format } from 'util/com';
import request from 'util/request';
import _ from 'lodash';
import { useMediaQuery } from 'react-responsive';

import 'styles/StandardProduct.scss';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';
import icon_del from 'images/icon_del.svg';
import MobileRefuser from 'components/template/MobileRefuser';

const StandardProduct = () => {
  const isMobile = useMediaQuery({
    query: '(max-width:1024px)',
  });

  const [goodsData, setGoodsData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [category, setCategory] = useState([]);
  const [categoryType, setCategoryType] = useState(0);
  const [tableRow, setTableRow] = useState(null);

  const nameRef = useRef(null);

  //ag-grid

  useEffect(() => {
    const goods = _.cloneDeep(Recoils.getState('DATA:GOODS'));
    const category = _.uniq(_.map(goods, 'goods_category'));
    setCategory(['전체', ...category]);
    setGoodsData(goods);
  }, []);

  const onChange = (key, e) => {
    setCategoryType(key);
  };

  const onSearch = (e) => {
    e.preventDefault();

    const goods_data = _.cloneDeep(Recoils.getState('DATA:GOODS'));

    const search_category = category[categoryType];
    let searchData = goods_data;
    if (categoryType !== 0)
      searchData = _.filter(goods_data, (goods) => {
        return _.includes(goods.goods_category, search_category);
      });

    const name = nameRef.current.value;
    if (name) {
      searchData = _.filter(searchData, (goods) => {
        return _.includes(goods.name, name);
      });
    }

    setGoodsData(searchData);
  };

  const onClickSearchRow = (e, d) => {
    e.preventDefault();
    const node = e.target.parentNode;

    let forms_match = Recoils.getState('DATA:FORMSMATCH');
    forms_match = forms_match && forms_match.length ? [...forms_match] : [];

    let goods_match = Recoils.getState('DATA:GOODSMATCH');
    goods_match = goods_match && goods_match.length ? [...goods_match] : [];

    goods_match = _.filter(goods_match, { goods_idx: d.idx });
    const result = [];

    for (const obj of goods_match) {
      const newObj = { ...obj };
      const findObj = _.find(forms_match, { idx: obj.forms_match_idx });
      if (findObj) {
        newObj.forms_name = findObj.forms_name;
        newObj.forms_product_name = findObj.forms_product_name;
        newObj.forms_option_name1 = findObj.forms_option_name1;
      }

      result.push(newObj);
    }

    setMatchData(result);
    setTableRow(node.rowIndex);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  const onSave = (e, d) => {
    request.post(`user/goods/match/save`, { save_data: d }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        Recoils.setState('DATA:GOODSMATCH', data.goods_match);
      }
    });
  };

  const onDelete = (e, d) => {
    e.preventDefault();
    request.post(`user/goods/match/delete`, { delete_data: d }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        Recoils.setState('DATA:FORMSMATCH', data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', data.goods_match);
        setMatchData(_.filter(matchData, (item) => item.idx != d.idx));
      }
    });
  };

  const onChangeStandardItem = (e, d, value) => {
    const findObj = _.find(matchData, { idx: d.idx });
    findObj.match_count = Number(value);
  };

  const onReset = () => {
    const goods = _.cloneDeep(Recoils.getState('DATA:GOODS'));
    const category = _.uniq(_.map(goods, 'goods_category'));
    setCategory(['전체', ...category]);
    setGoodsData(goods);

    setMatchData([]);
    setCategoryType(0);
    setTableRow(null);
    nameRef.current.value = '';
  };

  return (
    <>
      <Head />
      <Body title={`기준상품 연결 조회`} myClass={'standard_product'}>
        <FormManagementNavTab active="/settlement/standard_product" />
        <div className="page">
          {isMobile ? (
            <>
              <MobileRefuser></MobileRefuser>
            </>
          ) : (
            <>
              <div className="section1">
                <h3>기준상품 연결 조회 </h3>
                <div className="inputbox">
                  {/* <DropdownButton variant="" title={category[categoryType]}>
                {category &&
                  category.map((item, key) => (
                    <Dropdown.Item
                      key={key}
                      eventKey={key}
                      onClick={(e) => onChange(key, e)}
                      active={categoryType === key}
                    >
                      {category[key]}
                    </Dropdown.Item>
                  ))}
              </DropdownButton> */}
                  <input
                    type="text"
                    placeholder={'상품명'}
                    ref={nameRef}
                    className="input_search"
                    onKeyDown={handleKeyDown}
                  ></input>
                  <Button onClick={onSearch} className="btn_search">
                    <img src={`${img_src}${icon_search}`} />
                  </Button>

                  <Button className="btn_reset" onClick={onReset}>
                    <img src={`${img_src}${icon_reset}`} />
                  </Button>
                </div>
                <div className="tablebox">
                  <table className="thead">
                    <thead>
                      <th>상품코드</th>
                      {/* <th>카테고리</th> */}
                      <th>상품명</th>
                    </thead>
                  </table>
                  <table className="tbody">
                    <tbody>
                      <>
                        {goodsData &&
                          goodsData.map((d, key) => (
                            <GoodsItem
                              key={key}
                              index={key}
                              d={d}
                              onClick={(e) => {
                                onClickSearchRow(e, d);
                              }}
                              tableRow={tableRow}
                            />
                          ))}
                      </>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="section2">
                <h3>
                  연결한 판매상품 <span>{matchData.length}</span>
                </h3>
                {/* 이부분 데이터가 뿌려지는 걸 못봐서 나중에 다시 스타일 잡을게요! 
            이 부분을 AGGrid로 하자고 말씀해주셨었나요..?ㅠ 여기는 별 기능이없어
            그냥 테이블로 바꿔놓을게요 ?*/}

                <div className="tablebox">
                  <table className="thead">
                    <thead>
                      <th>연결일시</th>
                      <th>주문매체</th>
                      <th>상품명</th>
                      <th>옵션</th>
                      <th>수량</th>
                      {/* <th>수수료</th> */}
                      <th></th>
                    </thead>
                  </table>
                  <table className="tbody">
                    <tbody>
                      <>
                        {matchData &&
                          matchData.map((d, key) => (
                            <StandardProductItem
                              key={key}
                              index={key}
                              d={d}
                              onChange={onChangeStandardItem}
                              onSave={onSave}
                              onDelete={onDelete}
                            />
                          ))}
                      </>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </Body>
      <Footer />
    </>
  );
};

const GoodsItem = React.memo(({ index, d, onClick, tableRow }) => {
  //logger.debug('GoodsItem : ', index);
  return (
    <tr
      className={index == tableRow ? 'select' : ''}
      onClick={(e) => {
        onClick(e);
      }}
    >
      <td>{d.idx}</td>
      {/* <td>{d.goods_category}</td> */}
      <td>{d.name}</td>
    </tr>
  );
});

const StandardProductItem = React.memo(({ index, d, onChange, onSave, onDelete }) => {
  //logger.debug('GoodsMatchItem : ', index);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.value = d.match_count;
  }, [d]);

  return (
    <tr>
      <td>{time_format(d.reg_date)}</td>
      <td>{d.forms_name}</td>
      <td>{d.forms_product_name}</td>
      <td>
        {d.forms_option_name1}
        {d.forms_option_name2 && d.forms_option_name2}
        {d.forms_option_name3 && d.forms_option_name3}
      </td>
      <td>
        <input
          type={'number'}
          ref={inputRef}
          defaultValue={d.match_count}
          onChange={(e) => {
            onChange(e, d, inputRef.current.value);
          }}
        ></input>
      </td>
      {/* 
      <td>
        {d.category_fee_rate && Number(d.category_fee_rate).toFixed(2) ? '-' : Number(d.category_fee_rate).toFixed(2)}
      </td> */}
      <td>
        <button
          className="btn-primary btn_blue btn_small"
          onClick={(e) => {
            onSave(e, d);
          }}
        >
          저장
        </button>
        <button
          className="btn_del"
          onClick={(e) => {
            onDelete(e, d);
          }}
        >
          <img src={`${img_src}${icon_del}`} />
        </button>
      </td>
    </tr>
  );
});

export default React.memo(StandardProduct);
