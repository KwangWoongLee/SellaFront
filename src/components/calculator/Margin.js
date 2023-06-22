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
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

const Margin = () => {
  logger.render('Margin');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [rowData, setDatas] = useState([]);
  const [goodsData, setGoodsData] = useState([]);
  const [platformData, setplatformData] = useState([]);
  const [platformType, setplatformType] = useState(0);
  const [modalState, setModalState] = useState(false);

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

        if (ret.data) {
          const margin_results = ret.data.margin_results;
          const goods_result = ret.data.goods_result;
          const platform_result = ret.data.platform_data;

          margin_results ? setDatas(margin_results) : setDatas([]);
          goods_result ? setGoodsData(goods_result) : setGoodsData([]);
          platform_result ? setplatformData(platform_result) : setplatformData([]);

          if (platform_result && platform_result.length) {
            platformFeeRateRef.current.value = platform_result[0].fee_rate;
            platformDeliverFeeRateRef.current.value = platform_result[0].delivery_fee_rate;
          }
        }
      }
    });
  }, []);

  const onSave = () => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      let sellPrice = sellPriceRef.current.value;
      let sellDeliveryFee = sellDeliveryFeeRef.current.value;
      let stockPrice = stockPriceRef.current.value;
      let savedDPFee = savedDPFeeRef.current.value;
      let lowestMarginRate = lowestMarginRateRef.current.value;

      let platformFeeRate = platformFeeRateRef.current.value;
      platformFeeRate = platformFeeRate / 100;
      let platformDeliverFeeRate = platformDeliverFeeRateRef.current.value;
      platformDeliverFeeRate = platformDeliverFeeRate / 100;

      if (isNaN(sellPrice) || !sellPrice) return;
      if (isNaN(sellDeliveryFee) || !sellDeliveryFee) return;
      if (isNaN(stockPrice) || !stockPrice) return;
      if (isNaN(savedDPFee) || !savedDPFee) return;
      if (isNaN(lowestMarginRate) || !lowestMarginRate) return;

      sellPrice = Number(sellPrice);
      if (sellPrice <= 0) return;

      sellDeliveryFee = Number(sellDeliveryFee);
      if (sellDeliveryFee <= 0) return;

      stockPrice = Number(stockPrice);
      if (stockPrice <= 0) return;

      savedDPFee = Number(savedDPFee);
      if (savedDPFee <= 0) return;

      lowestMarginRate = Number(lowestMarginRate);
      if (lowestMarginRate <= 0 || lowestMarginRate >= 100) return;
      lowestMarginRate = lowestMarginRate / 100;

      let platformFee = sellPrice * platformFeeRate;
      let platformDeliveryFee = sellDeliveryFee * platformDeliverFeeRate;

      const sum_minus = stockPrice + savedDPFee + platformFee + platformDeliveryFee;
      setSumMinus(sum_minus);

      const sum_plus = sellPrice + sellDeliveryFee - sum_minus;
      setSumPlus(sum_plus);

      const marginRate = (sum_plus / sellPrice) * 100;

      const low =
        (sellDeliveryFee - stockPrice - savedDPFee - platformDeliveryFee) / (lowestMarginRate + platformFeeRate - 1);

      setLowestPrice(low);
    }
  };

  return (
    <>
      <Head />
      <Body title={`마진 계산기`}>
        <CalculatorNavTab active="/calculator/margin" />
        <div className="margin">
          <div className="">
            <Button variant="primary" onClick={onDelete}>
              초기화
            </Button>
            <Button variant="primary" onClick={onSave}>
              저장
            </Button>
            <table className="section">
              <caption></caption>
              <thead></thead>
              <tbody>
                <tr>
                  <td>판매가격</td>
                  <td>{}원</td>
                </tr>

                <tr>
                  <td>정산금액</td>
                  <td>{}원</td>
                </tr>

                <tr>
                  <td>순이익</td>
                  <td></td>
                </tr>

                <tr>
                  <td>마진율</td>
                  <td>{}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <Button variant="primary" onClick={onDelete}>
              선택 삭제
            </Button>
            <table className="section">
              <caption></caption>
              <thead></thead>
              <tbody>
                <tr>
                  <td>
                    <input type="button" onClick={onSearch} ref={nameRef}></input>
                  </td>
                </tr>

                <tr>
                  <td>+수익합계 {sumPlus}원</td>
                </tr>

                <tr>
                  <td>
                    {' '}
                    판매가격
                    <input
                      type="number"
                      ref={sellPriceRef}
                      onChange={(e) => {
                        onChangeInput(e, sellPriceRef);
                      }}
                    ></input>
                  </td>
                </tr>

                <tr>
                  <td>
                    {' '}
                    받은 배송비
                    <input type="number" ref={sellDeliveryFeeRef}></input>
                  </td>
                </tr>

                <tr>
                  <td>- 비용 합계 {sumMinus} 원</td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    매입가
                    <input type="number" ref={stockPriceRef}></input>
                  </td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    택배비 포장비
                    <input type="number" ref={savedDPFeeRef}></input>
                  </td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    수수료
                    <DropdownButton variant="" title={platformData.length ? platformData[platformType].name : ''}>
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
                  {' '}
                  <td>
                    {' '}
                    매체 수수료
                    <input type="number" disabled ref={platformFeeRateRef}></input>
                  </td>
                </tr>
                <tr>
                  {' '}
                  <td>
                    {' '}
                    배송비 수수료
                    <input type="number" disabled ref={platformDeliverFeeRateRef}></input>
                  </td>
                </tr>
                <tr>
                  {' '}
                  <td> 최저 판매가 {lowestPrice} 원</td>
                </tr>
                <tr>
                  {' '}
                  <td>
                    {' '}
                    최저 마진
                    <input type="number" ref={lowestMarginRateRef} onKeyDown={handleKeyDown}></input> %
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={containerStyle} className="tablebox">
              <div style={gridStyle} className="ag-theme-alpine test">
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  alwaysShowHorizontalScroll={true}
                  alwaysShowVerticalScroll={true}
                  defaultColDef={defaultColDef}
                  rowSelection={'multiple'}
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
        goods_data={goodsData}
        callback={PageCallback}
      ></SearchModal>
    </>
  );
};

export default React.memo(Margin);
