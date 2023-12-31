import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CalculatorNavTab from 'components/calculator/CalculatorNavTab';
import SearchModal from 'components/calculator/SearchModal';
import Recoils from 'recoils';

import { modal, logger, page_reload, revert_1000, replace_1000 } from 'util/com';
import request from 'util/request';
import _ from 'lodash';
import { useMediaQuery } from 'react-responsive';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Margin.scss';
import MobileRefuser from 'components/template/MobileRefuser';

const Margin = () => {
  const isMobile = useMediaQuery({
    query: '(max-width:1024px)',
  });

  const [rowData, setDatas] = useState([]);
  const platformData = [...Recoils.getState('SELLA:PLATFORM')];
  const [platformType, setplatformType] = useState(0);
  const [modalState, setModalState] = useState(false);
  const [abledSaveButton, setAbledSaveButton] = useState(false);

  const maxSaveCountRef = useRef(0);

  //inputs
  const nameRef = useRef(null);
  const sellPriceRef = useRef(null);
  const sellDeliveryFeeRef = useRef(null);
  const stockPriceRef = useRef(null);
  const savedDPFeeRef = useRef(null);
  const platformFeeRateRef = useRef(null);
  const platformDeliverFeeRateRef = useRef(null);
  const lowestMarginRateRef = useRef(null);
  const saveDataRef = useRef({});
  const nowSelectRowRef = useRef(null);
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
    {
      field: '',
      pinned: 'left',
      headerCheckboxSelection: true,
      lockPinned: true,
      cellClass: 'lock-pinned checkcell',
      checkboxSelection: true,
      maxWidth: 36,
      horizontal: 'Center',
    },
    {
      field: 'forms_name',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned uneditable',
      editable: false,
      headerName: '판매매체',
      filter: true,
    },

    {
      field: 'goods_name',
      sortable: true,
      unSortIcon: true,
      headerName: '상품명',
      filter: true,
      cellClass: 'uneditable',
    },
    {
      field: 'revenue_sum_price',
      sortable: true,
      unSortIcon: true,
      valueGetter: (params) => `${replace_1000(revert_1000(params.data.revenue_sum_price))} 원`,
      headerName: '판매가 + 받은 배송비',
      cellClass: 'uneditable',
    },
    {
      field: 'margin_price',
      sortable: true,
      unSortIcon: true,
      valueGetter: (params) => `${replace_1000(revert_1000(params.data.margin_price))} 원`,
      headerName: '순수익',
      cellClass: 'uneditable',
    },

    {
      field: 'margin_rate',
      hidden: true,
      sortable: true,
      unSortIcon: true,
      valueFormatter: (params) => {
        return `${Number(params.value)} %`;
      },
      valueParser: (params) => Number(params.newValue),
      headerName: '마진율',
      cellClass: 'uneditable',
    },
  ]);

  const rowHeight = 36;

  useEffect(() => {
    request.post(`user/calculator/margin`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        maxSaveCountRef.current = data.max_save_count;

        if (data.margin_results && data.margin_results.length > maxSaveCountRef.current - 1) {
          setAbledSaveButton(false);
        } else {
          setAbledSaveButton(true);
        }

        setDatas(() => data.margin_results);
      }
    });
  }, []);

  useEffect(() => {
    let platformFeeRate = Number(platformData[platformType].fee_rate);
    platformFeeRate = platformFeeRate.toFixed(2);
    platformFeeRateRef.current.value = platformFeeRate;

    let platformDeliverFeeRate = Number(platformData[platformType].delivery_fee_rate);
    platformDeliverFeeRate = platformDeliverFeeRate.toFixed(2);
    platformDeliverFeeRateRef.current.value = platformDeliverFeeRate;
  }, [platformType]);

  const onSave = () => {
    const name = nameRef.current.value;
    if (!name) {
      modal.alert('상품명을 입력해주세요.');
      return;
    }

    if (sumPlus !== 0 && !sumPlus) {
      modal.alert('계산하기를 먼저 실행해주세요.');
      return;
    }

    if (sumMinus !== 0 && !sumMinus) {
      modal.alert('계산하기를 먼저 실행해주세요.');
      return;
    }

    if (_.isEmpty(saveDataRef.current)) {
      modal.alert('계산하기를 먼저 실행해주세요.');
      return;
    }

    if (!platformData[platformType]) {
      modal.alert('고객센터에 문의해주세요.');
      return;
    }

    if (saveDataRef.current.idx && nameRef.current.value !== nowSelectRowRef.current.goods_name) {
      _.unset(saveDataRef.current, 'idx');
    }

    if (saveDataRef.current.idx) {
      request.post(`user/calculator/margin/modify`, { save_data: saveDataRef.current }).then((ret) => {
        if (!ret.err) {
          page_reload();
        }
      });
    } else {
      saveDataRef.current = { ...saveDataRef.current, goods_name: name };
      request.post(`user/calculator/margin/save`, { save_data: saveDataRef.current }).then((ret) => {
        if (!ret.err) {
          page_reload();
        }
      });
    }
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

  const onDelete = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedIdxs = _.map(selectedRows, 'idx');
      request.post(`user/calculator/margin/delete`, { idxs: selectedIdxs }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);
          page_reload();
        }
      });
    }
  };

  const onChange = (key, e) => {
    setplatformType(key);
  };

  const onChangeInput = (e, ref) => {
    // if (e.target.value.match('^[a-zA-Z ]*$') != null) {
    //   ref.current.value = e.target.value;
    // }
    ref.current.value = replace_1000(revert_1000(e.target.value));
  };

  const onClickCalc = (e) => {
    let sellPrice = sellPriceRef.current.value;
    let sellDeliveryFee = sellDeliveryFeeRef.current.value;
    let stockPrice = stockPriceRef.current.value;
    let savedDPFee = savedDPFeeRef.current.value;
    // let lowestMarginRate = lowestMarginRateRef.current.value;

    let platformFeeRate = platformFeeRateRef.current.value;
    let platformDeliverFeeRate = platformDeliverFeeRateRef.current.value;

    if (sellPrice === '') {
      modal.alert('판매가격을 입력해주세요.');
      return;
    }
    if (sellDeliveryFee === '') {
      modal.alert('받은 배송비를 입력해주세요.');
      return;
    }
    if (stockPrice === '') {
      modal.alert('매입가를 입력해주세요.');
      return;
    }
    if (savedDPFee === '') {
      modal.alert('택배비·포장비 를 입력해주세요.');
      return;
    }
    // if (isNaN(lowestMarginRate) || lowestMarginRate === '') {
    //   lowestMarginRate = 0;
    //   lowestMarginRateRef.current.value = 0;
    // }

    sellPrice = revert_1000(sellPrice);
    if (sellPrice === 0) {
      modal.alert('판매가격은 0원 일 수 없습니다.');
      return;
    }

    sellDeliveryFee = revert_1000(sellDeliveryFee);
    stockPrice = revert_1000(stockPrice);
    savedDPFee = revert_1000(savedDPFee);

    // lowestMarginRate = Number(lowestMarginRate);
    // if (lowestMarginRate < 0 || lowestMarginRate >= 100) {
    //   modal.alert('최저마진율을 0~100% 사이로 입력해주세요.');
    //   return;
    // }
    // lowestMarginRate = lowestMarginRate / 100;

    platformFeeRate = Number(platformFeeRate);
    if (platformFeeRate < 0 || platformFeeRate >= 100) {
      modal.alert('매체 수수료율을 0~100% 사이로 입력해주세요.');
      return;
    }
    platformFeeRate = platformFeeRate / 100;
    platformFeeRate = Number(platformFeeRate.toFixed(5));

    platformDeliverFeeRate = Number(platformDeliverFeeRate);
    if (platformDeliverFeeRate < 0 || platformDeliverFeeRate >= 100) {
      modal.alert('배송비 수수료율을 0~100% 사이로 입력해주세요.');
      return;
    }

    platformDeliverFeeRate = platformDeliverFeeRate / 100;
    platformDeliverFeeRate = Number(platformDeliverFeeRate.toFixed(5));

    let platformFee = sellPrice * platformFeeRate;
    let platformDeliveryFee = sellDeliveryFee * platformDeliverFeeRate;

    const sum_minus = stockPrice + savedDPFee; // 비용합계
    setSumMinus(sum_minus);

    const sum_plus = sellPrice + sellDeliveryFee; // 수익합계
    setSumPlus(sum_plus);

    const settlement_price = (sellPrice - platformFee + sellDeliveryFee - platformDeliveryFee).toFixed(0);
    let margin = settlement_price - sum_minus;
    margin = Number(Math.round(margin));
    let marginRate = (margin / sellPrice) * 100;
    marginRate = Number(marginRate.toFixed(1));

    // const test = lowestMarginRate + platformFeeRate - 1;
    // if (test == 0) {
    //   modal.alert('최저마진율 + 매체 수수료는 1이 될 수 없습니다.');
    //   return;
    // }

    // let low =
    //   (sellDeliveryFee - stockPrice - savedDPFee - platformDeliveryFee) / (lowestMarginRate + platformFeeRate - 1);
    // low = Number(low.toFixed(1));

    // setLowestPrice(low);

    const result = {
      sell_price: sellPrice,
      settlement_price: settlement_price,
      margin: margin,
      margin_rate: marginRate,
    };

    saveDataRef.current = {
      idx: saveDataRef.current.idx ? saveDataRef.current.idx : null,
      forms_name: platformData[platformType].name,
      sell_price: sellPrice,
      revenue_sum_price: sum_plus,
      expense_sum_price: sum_minus,
      margin_price: margin,
      margin_rate: marginRate,
      // lowest_standard_price: low,
      settlement_price: settlement_price,
      received_delivery_fee: sellDeliveryFee,
      stock_price: stockPrice,
      saved_dp_fee: savedDPFee,
      platform: platformData[platformType].name,
      platform_fee_rate: Number((platformFeeRate * 100).toFixed(2)),
      platform_delivery_fee_rate: Number((platformDeliverFeeRate * 100).toFixed(2)),
      // lowest_margin_rate: lowestMarginRate,
    };

    if (saveDataRef.current.idx !== null) {
      setAbledSaveButton(true);
    }

    setResultData({ ...result });
  };

  const onReset = () => {
    nameRef.current.value = '';
    sellPriceRef.current.value = '';
    sellDeliveryFeeRef.current.value = '';
    stockPriceRef.current.value = '';
    savedDPFeeRef.current.value = '';
    // lowestMarginRateRef.current.value = '';
    // setLowestPrice(0);
    setSumMinus(0);
    setSumPlus(0);
    setResultData({
      sell_price: 0,
      settlement_price: 0,
      margin: 0,
      margin_rate: 0,
    });
    setplatformType(0);
    saveDataRef.current = {};
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  const onSelectionChanged = (params) => {
    setAbledSaveButton(false);
    const selectedRows = gridRef.current.api.getSelectedRows();
    const row = selectedRows[0];
    if (!row) {
      onReset();
      return;
    }

    nowSelectRowRef.current = row;
    nameRef.current.value = `${row.goods_name}`;
    sellPriceRef.current.value = `${replace_1000(row.sell_price)}`;
    sellDeliveryFeeRef.current.value = `${replace_1000(row.received_delivery_fee)}`;
    stockPriceRef.current.value = `${replace_1000(row.stock_price)}`;
    savedDPFeeRef.current.value = `${replace_1000(row.saved_dp_fee)}`;
    // lowestMarginRateRef.current.value = `${row.lowest_margin_rate}`;
    setLowestPrice(row.lowest_standard_price);
    setSumMinus(row.expense_sum_price);
    setSumPlus(row.revenue_sum_price);
    setResultData({
      sell_price: row.sell_price,
      settlement_price: row.settlement_price,
      margin: row.margin_price,
      margin_rate: row.margin_rate,
    });

    const findIndex = _.findIndex(platformData, (p) => p.name == row.forms_name);
    if (findIndex != -1) {
      setplatformType(findIndex);

      platformFeeRateRef.current.value = row.platform_fee_rate;
      platformDeliverFeeRateRef.current.value = row.platform_delivery_fee_rate;
    }

    saveDataRef.current = row;
  };

  return (
    <>
      <Head></Head>
      <Body title={`마진 계산기`} myClass={'margin'}>
        {/* <CalculatorNavTab active="/calculator/margin" /> */}
        <div className="page">
          {isMobile ? (
            <>
              <MobileRefuser></MobileRefuser>
            </>
          ) : (
            <>
              <div className="section section1">
                <div className="btnbox">
                  <Button variant="primary" onClick={onReset}>
                    초기화
                  </Button>

                  <Button disabled={!abledSaveButton} variant="primary" onClick={onSave} className="btn_blue">
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
                        <th>정산금액</th>
                        <td>
                          {replace_1000(revert_1000(resultData.settlement_price))}
                          <span> 원</span>
                        </td>
                      </tr>

                      <tr>
                        <th>판매이익</th>
                        <td className={resultData.margin >= 0 ? 'txt_green' : 'txt_red'}>
                          <span>{resultData.margin >= 0 ? '이익' : '손해'} </span>
                          {resultData.margin > 0 && '+'}
                          {replace_1000(revert_1000(resultData.margin))}
                          <span> 원</span>
                        </td>
                      </tr>

                      <tr>
                        <th>마진율</th>
                        <td className={resultData.margin_rate >= 0 ? 'txt_green' : 'txt_red'}>
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
                        <td>
                          <span className="txt_green">판매가격</span>
                          <input
                            type="text"
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
                          <input
                            type="text"
                            ref={sellDeliveryFeeRef}
                            onChange={(e) => {
                              onChangeInput(e, sellDeliveryFeeRef);
                            }}
                          ></input>
                          <span>원</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className="txt_red">매입가</span>
                          <input
                            type="text"
                            ref={stockPriceRef}
                            onChange={(e) => {
                              onChangeInput(e, stockPriceRef);
                            }}
                          ></input>
                          <span>원</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className="txt_red inner">
                            보낸 배송비<i>(택배비·포장비)</i>
                          </span>
                          <input
                            type="text"
                            ref={savedDPFeeRef}
                            onChange={(e) => {
                              onChangeInput(e, savedDPFeeRef);
                            }}
                          ></input>
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
                  <span className="count">
                    <b>{rowData.length}</b> / {maxSaveCountRef.current}개
                  </span>
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
                      rowSelection={'single'}
                      overlayNoRowsTemplate={'데이터가 없습니다.'}
                      onSelectionChanged={onSelectionChanged}
                      rowHeight={rowHeight}
                    ></AgGridReact>
                  </div>
                </div>
              </div>
            </>
          )}
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
