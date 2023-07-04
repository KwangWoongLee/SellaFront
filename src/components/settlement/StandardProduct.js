import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';

import Recoils from 'recoils';
import { logger } from 'util/com';
import request from 'util/request';
import _ from 'lodash';

import 'styles/StandardProduct.scss';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const StandardProduct = () => {
  logger.render('StandardProduct');

  const [goodsData, setGoodsData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [categoryType, setCategoryType] = useState(0);
  const [tableRow, setTableRow] = useState(null);

  const nameRef = useRef(null);

  useEffect(() => {
    const goods = [...Recoils.getState('DATA:GOODS')];

    setGoodsData(goods);
  }, []);

  const onChange = (key, e) => {
    setCategoryType(key);
  };

  const onSearch = (e) => {
    e.preventDefault();
    // let goods_data = _.cloneDeep(goodsData);

    // const category = goodsData[categoryType].goods_category;
    // if (category !== '전체') {
    //   goods_data = _.filter(goods_data, (goods) => {
    //     return _.includes(goods.goods_category, category);
    //   });
    // }

    // const name = nameRef.current.value;
    // if (name) {
    //   goods_data = _.filter(goods_data, (goods) => {
    //     return _.includes(goods.name, name);
    //   });
    // }

    // setSearchData(goods_data);
  };

  const onClickSearchRow = (e, d) => {
    e.preventDefault();
    const node = e.target.parentNode;

    let goods_match = [...Recoils.getState('DATA:GOODSMATCH')];
    goods_match = _.filter(goods_match, { goods_idx: d.idx });

    setMatchData(goods_match);
    setTableRow(node.rowIndex);
  };

  return (
    <>
      <Head />
      <Body title={`기준상품 연결 조회`} myClass={'standard_product'}>
        <SettlementNavTab active="/settlement/standard_product" />
        <div className="page">
          <div className="section1">
            <h3>기준상품 연결 조회 </h3>
            <div className="inputbox">
              <DropdownButton variant="" title={goodsData.length ? goodsData[categoryType].category : ''}>
                {goodsData &&
                  _.uniqBy(goodsData, 'category').map((item, key) => (
                    <Dropdown.Item
                      key={key}
                      eventKey={key}
                      onClick={(e) => onChange(key, e)}
                      active={categoryType === key}
                    >
                      {item.category}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>
              <input type="text" placeholder={'상품명'} ref={nameRef} className="input_search"></input>
              <Button onClick={onSearch} className="btn_search">
                <img src={icon_search} />
              </Button>
              {/* 리셋버튼 추가했어요!, 검색 결과 출력 후 초기화 할때 쓰려구요! */}
              <Button className="btn_reset">
                <img src={icon_reset} />
              </Button>
            </div>
            <div className="tablebox">
              <table className="thead">
                <thead>
                  <th>상품코드</th>
                  <th>카테고리</th>
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
              기준상품 연결 조회 <span>0</span> {/* 연결된 상품 수 출력 */}
            </h3>
            <div className="tablebox">
              <table className="thead">
                <thead>
                  <th>연결일시</th>
                  <th>주문 매체</th>
                  <th>상품명</th>
                  <th>옵션</th>
                  <th>수량</th>
                  <th>수수료</th>
                  <th></th>
                </thead>
              </table>
              {/* 이부분 데이터가 뿌려지는 걸 못봐서 나중에 다시 스타일 잡을게요! */}
              <table className="tbody">
                <tbody>
                  <>{matchData && matchData.map((d, key) => <GoodsMatchItem key={key} index={key} d={d} />)}</>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

const GoodsItem = React.memo(({ index, d, onClick, tableRow }) => {
  logger.render('GoodsItem : ', index);
  return (
    <tr
      className={index == tableRow ? 'select' : ''}
      onClick={(e) => {
        onClick(e);
      }}
    >
      <td>{d.idx}</td>
      <td>{d.category}</td>
      <td>{d.name}</td>
    </tr>
  );
});

const GoodsMatchItem = React.memo(({ index, d }) => {
  logger.render('GoodsMatchItem : ', index);
  return (
    <tr>
      <td>{d.reg_date}</td>
      <td>{d.forms_name}</td>
      <td>{d.name}</td>
      <td>{d.forms_option1}</td>
      <td>{d.count}</td>
      <td>{d.category_fee}</td>
    </tr>
  );
});

export default React.memo(StandardProduct);
