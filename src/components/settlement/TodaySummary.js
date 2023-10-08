import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { page_reload, replace_1000, revert_1000, time_format, time_format_day } from 'util/com';
import request from 'util/request';
import { modal } from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import CustomCalendar from 'components/common/CustomCalendar';
import CommonDateModal from 'components/common/CommonDateModal';

const columnDefs = [
  { field: 'idx', hide: true },
  {
    field: '',
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned checkcell',
    checkboxSelection: true,
    maxWidth: 36,
    horizontal: 'Center',
  },
  {
    field: 'reg_date',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned uneditable',
    editable: false,
    headerName: '업로드 시간',
    filter: false,
    unSortIcon: true,
    width: 120,
    valueFormatter: (params) => {
      return time_format(params.value);
    },
  },

  {
    field: 'forms_name',
    sortable: true,
    unSortIcon: true,
    headerName: '매체',
    cellClass: 'uneditable',
    minWidth: 120,
  },
  {
    field: 'unique_order_no_count',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '주문 수',
    cellClass: 'uneditable',
    minWidth: 100,
  },
  {
    field: 'delivery_send_count',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '택배발송',
    cellClass: 'uneditable',
    minWidth: 140,
  },

  {
    field: 'sum_payment_price',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '총 결제금액',
    cellClass: 'uneditable',
    minWidth: 140,
  },
  {
    field: 'sum_received_delivery_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '받은 배송비',
    cellClass: 'uneditable',
    minWidth: 120,
  },
  {
    field: 'sum_profit_loss',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '손익합계',
    cellClass: 'uneditable',
    minWidth: 100,
  },
];

const TodaySummary = () => {
  logger.render('TodaySummary');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;

  const [viewResult, setViewResult] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [selectedDayGroup, setSelectedDayGroup] = useState('');
  const [dayData, setDayData] = useState({});
  const [dateModalState, setDateModalState] = useState(false);
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

        if (data && data.length) {
          const dayGroupDatas = {};

          for (const event of data) {
            const day = time_format_day(event.reg_date);
            event.group = day;

            if (!dayGroupDatas[day]) {
              dayGroupDatas[day] = {
                group: day,
                start: new Date(event.reg_date),
                end: new Date(event.reg_date),
                title: 0,
                events: [],
              };
            }

            dayGroupDatas[day]['events'].push(event);
            dayGroupDatas[day]['title'] += revert_1000(event['sum_profit_loss']);
          }

          for (const key in dayGroupDatas) {
            if (dayGroupDatas[key].title) {
              let prefix = '';
              if (dayGroupDatas[key].title > 0) prefix = '+ 이익';
              else prefix = '- 손해';

              dayGroupDatas[key].title = `${prefix} ${replace_1000(dayGroupDatas[key].title)}`;
            }
          }

          setDayData(_.cloneDeep(dayGroupDatas));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (dayData[selectedDayGroup]) setRowData(dayData[selectedDayGroup]['events']);
  }, [selectedDayGroup]);

  useEffect(() => {
    let summary = {
      unique_order_no_count: 0,
      delivery_send_count: 0,
      loss_order_no_count: 0,
      sum_payment_price: 0,
      sum_received_delivery_fee: 0,
      sum_profit_loss: 0,
    };

    if (rowData && rowData.length > 0) {
      summary = {
        unique_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'unique_order_no_count'))),
        delivery_send_count: replace_1000(revert_1000(_.sumBy(rowData, 'delivery_send_count'))),
        loss_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'loss_order_no_count'))),
        sum_payment_price: replace_1000(revert_1000(_.sumBy(rowData, 'sum_payment_price'))),
        sum_received_delivery_fee: replace_1000(revert_1000(_.sumBy(rowData, 'sum_received_delivery_fee'))),
        sum_profit_loss: replace_1000(revert_1000(_.sumBy(rowData, 'sum_profit_loss'))),
      };
    }

    setViewResult(summary);
  }, [rowData]);

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
      }
    });
  };

  const onSelectionChanged = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];
    // if (node) setViewResult(node);
  };

  const onChangeDate = (date) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];
    if (node) {
      request.post('user/today_summary/modify', { idx: node.idx, date: new Date(date) }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;

          page_reload();
        }
      });
    }
  };

  return (
    <>
      <Head />
      <Body title={`오늘 주문 합계`} myClass={'today_summary'}>
        <SettlementNavTab active="/settlement/today_summary" />

        <div className="page">
          <div className="btnbox">
            <Button variant="primary" onClick={onDelete} className="btn_red">
              선택 삭제
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setDateModalState(true);
              }}
            >
              선택한 주문서 날짜 변경
            </Button>
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
            <li className={viewResult && revert_1000(viewResult.sum_profit_loss) > 0 ? 'profit' : 'loss'}>
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
                overlayNoRowsTemplate={'데이터가 없습니다.'}
                onSelectionChanged={onSelectionChanged}
              ></AgGridReact>
            </div>
          </div>
        </div>
        <CustomCalendar
          dayGroupDatas={dayData}
          selectCallback={(e) => {
            setSelectedDayGroup(e.group);
          }}
        ></CustomCalendar>
      </Body>
      <Footer />

      <CommonDateModal
        modalState={dateModalState}
        setModalState={setDateModalState}
        onChangeDate={onChangeDate}
      ></CommonDateModal>
    </>
  );
};

export default React.memo(TodaySummary);
