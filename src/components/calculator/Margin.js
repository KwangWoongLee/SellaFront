import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CalculatorNavTab from 'components/calculator/CalculatorNavTab';
import SearchModal from 'components/calculator/SearchModal';
import Recoils from 'recoils';

import { logger } from 'util/com';
import request from 'util/request';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Margin.scss';

const Margin = () => {
  logger.render('Margin');

  const [rowData, setDatas] = useState([]);
  const platformData = [...Recoils.getState('SELLA:PLATFORM')];
  const [platformType, setplatformType] = useState(0);
  const [modalState, setModalState] = useState(false);

  const saveRef = useRef({});

  //inputs
  const nameRef = useRef(null);
  const sellPriceRef = useRef(null);
  const sellDeliveryFeeRef = useRef(null);
  const stockPriceRef = useRef(null);
  const savedDPFeeRef = useRef(null);
  const platformFeeRateRef = useRef(null);
  const platformDeliverFeeRateRef = useRef(null);
  const lowestMarginRateRef = useRef(null);
  //

  const [resultData, setResultData] = useState({
    sell_price: 0,
    settlement_price: 0,
    margin: 0,
    margin_rate: 0,
  });
  const [sumMinus, setSumMinus] = useState(0);
  const [sumPlus, setSumPlus] = useState(0);
  const [lowestPrice, setLowestPrice] = useState('');

  //ag-grid

  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  const [columnDefs] = useState([
    { field: '', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', checkboxSelection: true, width: 5 },
    {
      field: '',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '판매매체',
      filter: true,
    },

    { field: 'name', sortable: true, unSortIcon: true, headerName: '상품명', filter: true },
    {
      field: 'revenue_sum_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '수익합계',
    },
    {
      field: 'expense_sum_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '비용합계',
    },
    {
      field: 'margin_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '순수익',
    },
    {
      field: 'lowest_standard_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '최저기준가',
    },
  ]);

  useEffect(() => {
    request.post(`user/calculator/margin`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        // setDatas(() => ret.data);
      }
    });
  }, []);

  const onSave = () => {
    // if (saveRef.current) {
    //   const saveData = saveRef.current;
    // }
    const name = nameRef.current.value;
    const sellPrice = sellPriceRef.current.value;
    const sellDeliveryFee = sellDeliveryFeeRef.current.value;
    const stockPrice = stockPriceRef.current.value;
    const savedDPFee = savedDPFeeRef.current.value;
    const platformFeeRate = platformFeeRateRef.current.value;
    const platformDeliverFeeRate = platformDeliverFeeRateRef.current.value;
    const lowestMarginRate = lowestMarginRateRef.current.value;
  };
  const onSearch = () => {
    setModalState(true);
  };

  const PageCallback = (goods) => {
    nameRef.current.value = goods.name;
    stockPriceRef.current.value = goods.stock_price;
    savedDPFeeRef.current.value = goods.delivery_fee + goods.packing_fee;
    // sellPriceRef.current.value;
    // sellDeliveryFeeRef.current.value;
  };

  const onDelete = () => {};

  const onChange = (key, e) => {
    setplatformType(key);

    platformFeeRateRef.current.value = platformData[key].fee_rate;
    platformDeliverFeeRateRef.current.value = platformData[key].delivery_fee_rate;
  };

  const onChangeInput = (e, ref) => {
    if (e.target.value.match('^[a-zA-Z ]*$') != null) {
      ref.current.value = e.target.value;
    }
  };

  const onClickCalc = (e) => {
    let sellPrice = sellPriceRef.current.value;
    let sellDeliveryFee = sellDeliveryFeeRef.current.value;
    let stockPrice = stockPriceRef.current.value;
    let savedDPFee = savedDPFeeRef.current.value;
    let lowestMarginRate = lowestMarginRateRef.current.value;

    let platformFeeRate = platformFeeRateRef.current.value;
    platformFeeRate = platformFeeRate / 100;
    let platformDeliverFeeRate = platformDeliverFeeRateRef.current.value;
    platformDeliverFeeRate = platformDeliverFeeRate / 100;

    if (isNaN(sellPrice)) return;
    if (isNaN(sellDeliveryFee)) return;
    if (isNaN(stockPrice)) return;
    if (isNaN(savedDPFee)) return;
    if (isNaN(lowestMarginRate)) return;

    sellPrice = Number(sellPrice);
    if (sellPrice < 0) return;

    sellDeliveryFee = Number(sellDeliveryFee);
    if (sellDeliveryFee < 0) return;

    stockPrice = Number(stockPrice);
    if (stockPrice < 0) return;

    savedDPFee = Number(savedDPFee);
    if (savedDPFee < 0) return;

    lowestMarginRate = Number(lowestMarginRate);
    if (lowestMarginRate < 0 || lowestMarginRate >= 100) return;
    lowestMarginRate = lowestMarginRate / 100;

    let platformFee = sellPrice * platformFeeRate;
    let platformDeliveryFee = sellDeliveryFee * platformDeliverFeeRate;

    const sum_minus = stockPrice + savedDPFee;
    setSumMinus(sum_minus);

    const sum_plus = sellPrice + sellDeliveryFee;
    setSumPlus(sum_plus);

    const margin = sum_plus - sumMinus - platformFee - platformDeliveryFee;
    const marginRate = (margin / sellPrice) * 100;

    const test = lowestMarginRate + platformFeeRate - 1;
    if (test == 0) return;

    const low =
      (sellDeliveryFee - stockPrice - savedDPFee - platformDeliveryFee) / (lowestMarginRate + platformFeeRate - 1);

    setLowestPrice(Math.floor(low));

    const result = {
      sell_price: sellPrice,
      settlement_price: 0,
      margin: Math.floor(margin),
      margin_rate: marginRate ? Math.floor(marginRate * 10) / 10 : 0,
    };

    setResultData({ ...result });
  };

  const onReset = () => {
    nameRef.current.value = '';
    sellPriceRef.current.value = '';
    sellDeliveryFeeRef.current.value = '';
    stockPriceRef.current.value = '';
    savedDPFeeRef.current.value = '';
    lowestMarginRateRef.current.value = '';
    setLowestPrice(0);
    setSumMinus(0);
    setSumPlus(0);
    setResultData({
      sell_price: 0,
      settlement_price: 0,
      margin: 0,
      margin_rate: 0,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <>
      <Head></Head>
      <Body title={`마진 계산기`} myClass={'margin'}>
        <CalculatorNavTab active="/calculator/margin" />
        <div className="page">
          <div className="section section1">
            <div className="btnbox">
              <Button variant="primary" onClick={onReset}>
                초기화
              </Button>
              <Button variant="primary" onClick={onSave} className="btn_blue">
                저장
              </Button>
            </div>
            <div className="tablebox1">
              <table>
                <colgroup>
                  <col width="50px" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <th>판매가격</th>
                    <td>
                      {resultData.sell_price}
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <th>정산금액</th>
                    <td>
                      {resultData.settlement_price}
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <th>순이익</th>
                    <td className="txt_green">
                      <span>이익 + </span>
                      {resultData.margin}
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <th>마진율</th>
                    <td className="txt_green">
                      {resultData.margin_rate}
                      <span> %</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="tablebox2">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <input
                        ref={nameRef}
                        onKeyDown={handleKeyDown}
                        placeholder="상품명 입력"
                        className="input_prdname"
                      ></input>
                      <Button variant="primary" onClick={onSearch} className="btn btn_blue">
                        내 상품 찾기
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="td_sum green">
                      <span>+ 수익합계</span> {sumPlus} 원
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="txt_green">판매가격</span>
                      <input
                        type="number"
                        ref={sellPriceRef}
                        onChange={(e) => {
                          onChangeInput(e, sellPriceRef);
                        }}
                      ></input>
                      <span>원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="txt_green">받은 배송비</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span>원</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="td_sum red">
                      <span>- 비용 합계</span> {sumMinus} 원
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="txt_red">매입가</span>
                      <input type="number" ref={stockPriceRef}></input>
                      <span>원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="txt_red ">택배비·포장비</span>
                      <input type="number" ref={savedDPFeeRef}></input>
                      <span>원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="txt_red">수수료</span>
                      <DropdownButton
                        variant=""
                        title={platformData.length ? platformData[platformType].name : ''}
                        className="nounit"
                      >
                        {platformData &&
                          platformData.map((item, key) => (
                            <Dropdown.Item
                              key={key}
                              eventKey={key}
                              onClick={(e) => onChange(key, e)}
                              active={platformType === key}
                            >
                              {item.name}
                            </Dropdown.Item>
                          ))}
                      </DropdownButton>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="txt_small">매체 수수료</span>
                      <input type="number" ref={platformFeeRateRef}></input>
                      <span>%</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="txt_small">배송비 수수료</span>
                      <input type="number" ref={platformDeliverFeeRateRef}></input>
                      <span>%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="td_sum gray">
                      <span>최저 판매가</span> {lowestPrice} 원
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>최저 마진율</span>
                      <input type="number" ref={lowestMarginRateRef}></input>
                      <span>%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button variant="primary" className="btn_blue btn_calc" onClick={onClickCalc}>
              계산하기
            </Button>
          </div>
          <div className="section section2">
            <div className="btnbox">
              <Button variant="primary" onClick={onDelete}>
                선택 삭제
              </Button>
            </div>
            <div style={containerStyle} className="tablebox">
              <div style={gridStyle} className="ag-theme-alpine">
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
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
        </div>
      </Body>
      <Footer />
      <SearchModal
        modalState={modalState}
        setModalState={setModalState}
        selectCallback={PageCallback}
        name={nameRef.current && nameRef.current.value}
      ></SearchModal>{' '}
    </>
  );
};

export default React.memo(Margin);
