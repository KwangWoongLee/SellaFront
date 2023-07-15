import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CalculatorNavTab from 'components/calculator/CalculatorNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';
import request from 'util/request';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Margin.scss';

const Buying = () => {
  logger.render('Buying');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

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
    request.post(`user/calculator/margin`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

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

  return (
    <>
      <Head></Head>
      <Body title={`사입 계산기`} myClass={'buying'}>
        <CalculatorNavTab active="/calculator/buying" />
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
                    <th>제품별 매입단가</th>
                    <td>
                      {resultData.margin}
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <th>총 매입 예상 비용</th>
                    <td>
                      {resultData.margin_rate}
                      <span> 원</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="tablebox2">
              <table className="tbody">
                <tbody>
                  <tr>
                    <td>
                      <input ref={nameRef} placeholder="상품명 입력" className="input_prdname"></input>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="tbodyleft">
                <tbody>
                  <tr>
                    <td className="td_sum gray">
                      <span>제품 구매비</span> {sumPlus} 원
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>제품단가</span>
                      <div className="inputbox">
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> ¥</span>
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> 원</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>제품 수량</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>총 중량</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="span_br">
                        내륙 운송비
                        <br />
                        (제품 구매비)
                      </span>
                      <div className="inputbox">
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> ¥</span>
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> 원</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="td_sum gray">
                      <span>구매 대행비</span> {lowestPrice} 원
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>구매대행 수수료</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> %</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>구매대행비</span>
                      <div className="inputbox">
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> ¥</span>
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> 원</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>예상 운임비</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="tbodyright">
                <tbody>
                  <tr>
                    <td className="td_sum gray">
                      <span>환율</span> {sumPlus} 원
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>관세청 고시환율</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>업체 고시환율</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="td_sum gray">
                      <span>수수료/세금</span> {lowestPrice} 원
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>과세대상금액</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>통관비용</span>
                      <input type="number" ref={sellDeliveryFeeRef}></input>
                      <span> 원</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>관세 수수료</span>
                      <div className="inputbox">
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> %</span>
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> 원</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span>부가세</span>
                      <div className="inputbox">
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> %</span>
                        <input
                          type="number"
                          ref={sellPriceRef}
                          onChange={(e) => {
                            onChangeInput(e, sellPriceRef);
                          }}
                        ></input>
                        <span> 원</span>
                      </div>
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
    </>
  );
};

export default React.memo(Buying);
