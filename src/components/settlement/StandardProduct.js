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

const StandardProduct = () => {
  logger.render('StandardProduct');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [goodsData, setGoodsData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [categoryType, setCategoryType] = useState(0);

  const nameRef = useRef(null);

  useEffect(() => {
    const goods = [...Recoils.getState('DATA:GOODS')];
    const goods_match = [...Recoils.getState('DATA:GOODSMATCH')];

    setGoodsData(goods);
    setMatchData(goods_match);
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

  const onClickSearchRow = (e) => {
    console.log(1);
  };

  return (
    <>
      <Head />
      <Body title={`기준상품 연결 조회`} myClass={'standard_product'}>
        <SettlementNavTab active="/settlement/standard_product" />
        <div className="page">
          <div className="section1">
            <div className="topbox">
              <h3>기준상품 연결 조회 </h3>
              <div className="searchbox">
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
              </div>
            </div>
            <div className="tablebox">
              <table>
                <caption></caption>
                <thead>
                  <th>상품코드</th>
                  <th>카테고리</th>
                  <th>상품명</th>
                </thead>
                <tbody>
                  <>
                    {goodsData &&
                      goodsData.map((d, key) => <GoodsItem key={key} index={key} d={d} onClick={onClickSearchRow} />)}
                  </>
                </tbody>
              </table>
            </div>
          </div>
          <div className="section2">
            <div className="topbox">
              <h3>기준상품 연결 조회 </h3>
            </div>
            <div className="tablebox">
              {/* 일반 테이블에서 클릭 시 선택 표시 >> select 클래스 넣어주세요 
              여기 말고 다른 테이블도 선택된 상태 표시 >>> select 클래스 넣어주세요 */}
              {/* 이작업은 좀걸려요^^ 주말에 작업해드릴게요!*/}
              <table>
                <caption></caption>
                <thead>
                  <th>연결일시</th>
                  <th>주문 매체</th>
                  <th>상품명</th>
                  <th>옵션</th>
                  <th>수량</th>
                  <th>수수료</th>
                  <th>
                    <button>저장</button>
                    <button>제거</button>
                  </th>
                </thead>
                <tbody>
                  <>
                    {matchData &&
                      matchData.map((d, key) => (
                        <GoodsMatchItem key={key} index={key} d={d} onClick={onClickSearchRow} />
                      ))}
                  </>
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

const GoodsItem = React.memo(({ index, d, onClick }) => {
  logger.render('GoodsItem : ', index);
  return (
    <tr onClick={onClick}>
      <td>{d.idx}</td>
      <td>{d.category}</td>
      <td>{d.name}</td>
    </tr>
  );
});

const GoodsMatchItem = React.memo(({ index, d, onClick }) => {
  logger.render('GoodsItem : ', index);
  return (
    <tr onClick={onClick}>
      <td>{d.reg_date}</td>
      <td>{d.forms_name}</td>
      <td>{d.name}</td>
    </tr>
  );
});

export default React.memo(StandardProduct);
