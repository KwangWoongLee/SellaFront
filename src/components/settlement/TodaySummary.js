import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { img_src, modal, navigate } from 'util/com';
import request from 'util/request';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import Recoils from 'recoils';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import _, { sum } from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';

import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import ColumnControlModal from 'components/common/AgGrid/ColumnControlModal';
const PLFormatter = (params) => {
  let newValue = '';
  newValue += params.value > 0 ? '이익' : '손해';
  newValue += params.value;
  return newValue;
};

const columnDefs = [
  { field: 'idx', hide: true },
  { field: '', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', checkboxSelection: true, width: 5 },
  {
    field: 'reg_date',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned',
    editable: false,
    headerName: '업로드 시간',
    filter: false,
    unSortIcon: true,
    width: 120,
  },

  {
    field: 'forms_name',
    sortable: true,
    unSortIcon: true,
    headerName: '매체',
    minWidth: 120,
  },
  {
    field: 'unique_order_no_count',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '주문 수',
    minWidth: 100,
  },
  {
    field: 'delivery_send_count',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '택배발송',
    minWidth: 140,
  },

  {
    field: 'sum_payment_price',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '총 결제금액',
    minWidth: 140,
  },
  {
    field: 'sum_received_delivery_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '받은 배송비',
    minWidth: 120,
  },
  {
    field: 'sum_profit_loss',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '손익합계',
    minWidth: 100,
  },
];

const TodaySummary = () => {
  logger.render('TodaySummary');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;

  const [viewResult, setViewResult] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
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

  useEffect(() => {
    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    temp = _.sortBy(temp, ['_order']);
    setPlatforms(temp);

    request.post(`user/today_summary`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        setRowData(() => data);
      }
    });
  }, []);

  const onUpload = function () {
    setRowData([]);
    setViewResult(false);

    modal.file_upload(null, '.xlsx', '파일 업로드', { platform: platforms[platformType] }, (ret) => {
      if (!ret.err) {
        const { files } = ret;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        const items = [];
        reader.onload = (e) => {
          const bstr = e.target.result;
          const wb = xlsx.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });

          const title_array = platforms[platformType].title_array;
          const title_row = platforms[platformType].title_row;

          const expected = {};

          const titles = title_array.split(', ');
          for (const ts of titles) {
            const title_splits = ts.split('(');
            const header = title_splits[0];

            const match_data = title_splits[1].split(')')[0];
            const column = match_data.split(':')[0];
            expected[column] = header;
          }

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          // for (const key in ws) {
          //   const prevlast = key[key.length - 2];
          //   const last = key[key.length - 1];

          //   if (isNaN(prevlast) && !isNaN(last) && Number(last) === title_row) {
          //     const column = key.slice(0, key.length - 1);
          //     const header = ws[key]['h'];

          //     if (expected[column] !== header) return; // 에러
          //   }
          // }

          const frm = new FormData();
          frm.append('files', file);
          frm.append('Authorization', access_token);
          frm.append('platform', JSON.stringify(platforms[platformType]));

          request
            .post_form('settlement/profit_loss', frm, () => {})
            .then((ret) => {
              if (!ret.err) {
                const { data } = ret.data;
                setRowData(() => data);
              }
            });
        };

        if (rABS) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    });
  };

  const onChange = (key, e) => {
    setplatformType(key);
  };

  const onDelete = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (!selectedRows.length) return;
    const node = selectedRows[0];

    request.post('user/today_summary/delete', { idx: node.idx }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        setRowData(
          _.filter(rowData, (item) => {
            return item.idx != node.idx;
          })
        );
        setViewResult({});
      }
    });
  };

  const onSelectionChanged = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];

    const summary = {
      forms_name: node.forms_name,
      unique_order_no_count: node.unique_order_no_count,
      delivery_send_count: node.delivery_send_count,
      loss_order_no_count: node.loss_order_no_count,
      sum_payment_price: node.sum_payment_price,
      sum_received_delivery_fee: node.sum_received_delivery_fee,
      sum_profit_loss: node.sum_profit_loss,
    };

    setViewResult(summary);
  };

  const onClick = () => {};
  return (
    <>
      <Head />
      <Body title={`오늘 주문 합계`} myClass={'today_summary'}>
        <SettlementNavTab active="/settlement/today_summary" />

        <div className="page">
          <div className="inputbox">
            <DropdownButton variant="" title={platforms.length ? platforms[platformType].name : ''}>
              {platforms &&
                platforms.map((item, key) => (
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
            <Button variant="primary" onClick={onUpload} className="btn_green">
              <img src={`${img_src}${icon_circle_arrow_up}`} />새 주문서 업로드
            </Button>

            <div className="btnbox">
              <Button variant="primary" onClick={onDelete} className="btn_red">
                선택 삭제
              </Button>

              <span className="txt_red">※ 무료 서비스의 경우 매일 자정을 기준으로 저장된 주문서가 삭제됩니다.</span>
            </div>
          </div>

          <ul className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
            <li>
              <p className="dt">총 주문</p>
              <p className="dd">
                {viewResult.unique_order_no_count}
                <span>건</span>
              </p>
            </li>
            <li>
              <p className="dt">택배 발송</p>
              <p className="dd">
                {viewResult.delivery_send_count}
                <span>건</span>
              </p>
            </li>
            <li>
              <p className="dt">적자 주문</p>
              <span className="dd txt_red">
                {viewResult.loss_order_no_count}
                <span className="unit txt_red">건</span>
              </span>
            </li>
            <li>
              <p className="dt">상품 결제 금액</p>
              <p className="dd">
                {viewResult.sum_payment_price}
                <span>원</span>
              </p>
            </li>
            <li>
              <p className="dt">받은 배송비</p>
              <p className="dd">
                {viewResult.sum_received_delivery_fee}
                <span>원</span>
              </p>
            </li>
            {/* 손익합계 <li> className에 이익일때 profit, 손해일때 loss 넣어주세요. */}
            {/* 이 작업도 손익 계산이 다끝나면 하게 될 것 같아요! */}
            <li className={viewResult.sum_profit_loss > 0 ? 'profit' : 'loss'}>
              <p className="dt">손익 합계</p>
              <p className="dd">
                {viewResult.sum_profit_loss}
                <span>원</span>
              </p>
            </li>
          </ul>

          <div style={containerStyle} className="tablebox">
            <div style={gridStyle} className="ag-theme-alpine test">
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={true}
                alwaysShowVerticalScroll={true}
                defaultColDef={defaultColDef}
                rowSelection={'single'}
                onRowDoubleClicked={onClick}
                onSelectionChanged={onSelectionChanged}
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

export default React.memo(TodaySummary);
