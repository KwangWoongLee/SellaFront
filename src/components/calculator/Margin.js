import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button } from 'react-bootstrap';
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
  const [modalState, setModalState] = useState(false);

  //inputs
  const nameRef = useRef(null);
  const sellPriceRef = useRef(null);
  const sellDeliveryFeeRef = useRef(null);
  const stockPriceRef = useRef(null);
  const savedDPFeeRef = useRef(null);
  const flatformFeeRateRef = useRef(null);
  const flatformDeliverFeeRateRef = useRef(null);
  const lowestMarginRateRef = useRef(null);
  //

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
          const flatform_data = ret.data.flatform_data;

          margin_results ? setDatas(margin_results) : setDatas([]);
          goods_result ? setGoodsData(goods_result) : setGoodsData([]);
          // flatform_data ? setGoodsData(flatform_data) : setGoodsData([]);
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
    const flatformFeeRate = flatformFeeRateRef.current.value;
    const flatformDeliverFeeRate = flatformDeliverFeeRateRef.current.value;
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
    // flatformFeeRateRef.current.value;
    // flatformDeliverFeeRateRef.current.value;
    // lowestMarginRateRef.current.value;
  };

  const onDelete = () => {};
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
                  <td></td>
                </tr>

                <tr>
                  <td>정산금액</td>
                  <td></td>
                </tr>

                <tr>
                  <td>순이익</td>
                  <td></td>
                </tr>

                <tr>
                  <td>마진율</td>
                  <td></td>
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
                  <td>+수익합계 {}원</td>
                </tr>

                <tr>
                  <td>
                    {' '}
                    판매가격
                    <input type="text" ref={sellPriceRef}></input>
                  </td>
                </tr>

                <tr>
                  <td>
                    {' '}
                    받은 배송비
                    <input type="text" ref={sellDeliveryFeeRef}></input>
                  </td>
                </tr>

                <tr>
                  <td>- 비용 합계 {} 원</td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    매입가
                    <input type="text" ref={stockPriceRef}></input>
                  </td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    택배비 포장비
                    <input type="text" ref={savedDPFeeRef}></input>
                  </td>
                </tr>

                <tr>
                  {' '}
                  <td>
                    {' '}
                    수수료
                    <input type="text"></input>
                  </td>
                </tr>
                <tr>
                  {' '}
                  <td>
                    {' '}
                    매체 수수료
                    <input type="text" ref={flatformFeeRateRef}></input>
                  </td>
                </tr>
                <tr>
                  {' '}
                  <td>
                    {' '}
                    배송비 수수료
                    <input type="text" ref={flatformDeliverFeeRateRef}></input>
                  </td>
                </tr>
                <tr>
                  {' '}
                  <td> 최저 판매가 {} 원</td>
                </tr>
                <tr>
                  {' '}
                  <td>
                    {' '}
                    최저 마진
                    <input type="text" ref={lowestMarginRateRef}></input>
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
