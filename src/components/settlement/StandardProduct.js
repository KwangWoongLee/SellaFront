import React, { useState, useEffect, useRef, useMemo } from 'react';

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
import icon_del from 'images/icon_del.svg';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

const StandardProduct = () => {
  logger.render('StandardProduct');

  const [goodsData, setGoodsData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [category, setCategory] = useState([]);
  const [categoryType, setCategoryType] = useState(0);
  const [tableRow, setTableRow] = useState(null);

  const nameRef = useRef(null);

  //ag-grid

  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 80,
      autoHeight: true,
    };
  }, []);

  const [columnDefs] = useState([
    { field: 'reg_date', sortable: true, unSortIcon: true, headerName: '연결 일시', minWidth: 160 },
    {
      field: 'forms_name',
      sortable: true,
      unSortIcon: true,
      headerName: '주문 매체',
      minWidth: 120,
    },
    {
      field: 'forms_product_name',
      sortable: true,
      unSortIcon: true,
      headerName: '상품명',
      wrapText: true,
      vertical: 'Center',
      minWidth: 400,
    },
    {
      field: 'forms_option_name1',
      sortable: true,
      unSortIcon: true,
      headerName: '옵션',
      wrapText: true,
      vertical: 'Center',
      minWidth: 200,
    },
    {
      field: 'match_count',
      valueParser: (params) => Number(params.newValue),
      headerName: '수량',
      minWidth: 50,
    },
    {
      field: '',
      headerName: '',
      maxWidth: 140,
    },
  ]);

  useEffect(() => {
    const goods = [...Recoils.getState('DATA:GOODS')];

    setCategory(goods);
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

    let forms_match = [...Recoils.getState('DATA:FORMSMATCH')];
    let goods_match = [...Recoils.getState('DATA:GOODSMATCH')];
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

  const onUpdate = () => {};

  const onDelete = () => {};

  const onReset = () => {
    setGoodsData([]);
    setMatchData([]);
    setCategoryType(0);
    setTableRow(null);
    nameRef.current.value = '';
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
              <DropdownButton variant="" title={category.length ? category[categoryType].category : ''}>
                {category &&
                  _.uniqBy(category, 'category').map((item, key) => (
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

              <Button className="btn_reset" onClick={onReset}>
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
            {/* 이부분 데이터가 뿌려지는 걸 못봐서 나중에 다시 스타일 잡을게요! */}
            <div style={gridStyle} className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                rowData={matchData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={true}
                alwaysShowVerticalScroll={true}
                defaultColDef={defaultColDef}
                rowSelection={'multiple'}
                overlayNoRowsTemplate={'데이터가 없습니다.'}
              ></AgGridReact>
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

const GoodsMatchItem = React.memo(({ index, d, onUpdate, onDelete }) => {
  logger.render('GoodsMatchItem : ', index);
  return (
    <tr>
      <td>{d.reg_date}</td>
      <td>{d.forms_name}</td>
      <td>{d.forms_product_name}</td>
      <td>{d.forms_option_name1}</td>
      <td>{d.match_count}</td>
      <td>
        <button className="btn-primary btn_blue btn_small" onClick={onUpdate}>
          저장
        </button>
        <button className="btn_del" onClick={onDelete}>
          <img src={icon_del} />
        </button>
      </td>
    </tr>
  );
});

export default React.memo(StandardProduct);
