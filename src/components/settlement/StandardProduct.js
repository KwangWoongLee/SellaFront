import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import Recoils from 'recoils';
import { logger } from 'util/com';
import request from 'util/request';
import _ from 'lodash';

const StandardProduct = () => {
  logger.render('StandardProduct');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [info, setInfo] = useState(null);
  const [goodsData, setGoodsData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [categoryType, setCategoryType] = useState(0);

  const nameRef = useRef(null);

  useEffect(() => {
    request.post(`user/calculator/margin`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        if (ret.data) {
          const goods_result = ret.data.goods_result;

          goods_result ? setGoodsData(goods_result) : setGoodsData([]);
          goods_result ? setSearchData(goods_result) : setSearchData([]);
        }
      }
    });
  }, []);

  const onChange = (key, e) => {
    setCategoryType(key);
  };

  const onSearch = (e) => {
    e.preventDefault();
    let goods_data = _.cloneDeep(goodsData);

    const category = goodsData[categoryType].goods_category;
    if (category !== '전체') {
      goods_data = _.filter(goods_data, (goods) => {
        return _.includes(goods.goods_category, category);
      });
    }

    const name = nameRef.current.value;
    if (name) {
      goods_data = _.filter(goods_data, (goods) => {
        return _.includes(goods.name, name);
      });
    }

    setSearchData(goods_data);
  };

  const onClickSearchRow = (e) => {
    console.log(1);
  };

  return (
    <>
      <Head />
      <Body title={`기준상품 연결 조회`}>
        <SettlementNavTab active="/settlement/standard_product" />
        <div className="StandardProduct">
          기준상품 연결 조회{' '}
          <DropdownButton variant="" title={goodsData.length ? goodsData[categoryType].goods_category : ''}>
            {goodsData &&
              _.uniqBy(goodsData, 'goods_category').map((item, key) => (
                <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={categoryType === key}>
                  {item.goods_category}
                </Dropdown.Item>
              ))}
          </DropdownButton>
          <input type="text" ref={nameRef}></input>
          <Button onClick={onSearch}>찾기</Button>
          <table className="section">
            <caption></caption>
            <thead>
              <th>상품코드</th>
              <th>카테고리</th>
              <th>상품명</th>
            </thead>
            <tbody>
              <>
                {searchData &&
                  searchData.map((d, key) => <SearchItem key={key} index={key} d={d} onClick={onClickSearchRow} />)}
              </>
            </tbody>
          </table>
        </div>
      </Body>
      <Footer />
    </>
  );
};

const SearchItem = React.memo(({ index, d, onClick }) => {
  logger.render('SearchItem : ', index);
  return (
    <tr onClick={onClick}>
      <td>{d.idx}</td>
      <td>{d.goods_category}</td>
      <td>{d.name}</td>
    </tr>
  );
});

export default React.memo(StandardProduct);
