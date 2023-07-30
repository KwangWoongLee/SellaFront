import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import MarginCalc_UnConnectModal from 'components/settlement/MarginCalc_UnConnectModal';
import Recoils from 'recoils';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import moment from 'moment';

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';
import img_service from 'images/img_service.png';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import ColumnControlModal from 'components/common/AgGrid/ColumnControlModal';
const PLFormatter = (params) => {
  let newValue = '';
  newValue += params.value > 0 ? '이익 ' : '손해 ';
  newValue += params.value;
  return newValue;
};

const optionCellRenderer = (props) => {
  return (
    <>
      {props.data[30008]}
      {props.data[30011] && props.data[30011]}
      {props.data[30012] && props.data[30012]}
    </>
  );
};

//
const ROUTE_COLUMN_BASE = [
  {
    field: '',
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned checkcell',
    checkboxSelection: true,
    maxWidth: 36,
    horizontal: 'Center',
  },
  { field: 'idx', hide: true },
  {
    field: 'profit_loss',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned',
    editable: false,
    headerName: '손익',
    filter: false,
    unSortIcon: true,
    width: 140,
    valueFormatter: PLFormatter,
  },
  {
    field: '30003',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned',
    editable: false,
    headerName: '결제일',
    filter: false,
    unSortIcon: true,
    width: 170,
  },

  {
    field: '30002',
    rowSpan: (params) => (params.data.aggregation_rowspan ? params.data.aggregation_rowspan : 1),
    sortable: true,
    unSortIcon: true,
    headerName: '배송비묶음번호',
    maxWidth: 150,
  },
  {
    field: '30004',
    sortable: true,
    unSortIcon: true,
    headerName: '주문번호',
    maxWidth: 150,
  },
  {
    field: 'forms_name',
    sortable: true,
    unSortIcon: true,
    headerName: '매체',
    width: 150,
  },
  {
    field: '30007',
    sortable: true,
    unSortIcon: true,
    headerName: '판매상품명',
    minWidth: 400,
    wrapText: true,
    autoHeight: true,
    vertical: 'Center',
  },
  {
    field: '30008',
    sortable: true,
    unSortIcon: true,
    headerName: '옵션',
    minWidth: 300,
    wrapText: true,
    autoHeight: true,
    vertical: 'Center',
    cellRenderer: optionCellRenderer,
  },
  {
    field: '30005',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '수량',
    maxWidth: 80,
    autoHeight: true,
  },
  {
    field: '30006',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '총 결제금액\n(정산예정금액)',
    width: 130,
    autoHeight: true,
  },

  {
    field: '30047',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '받은 배송비',
    width: 120,
  },
  {
    field: 'stock_price',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '입고단가',
    width: 120,
  },
  {
    field: 'delivery_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '배송비',
    width: 120,
  },
  {
    field: 'packing_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '포장비',
    width: 120,
  },
  // {
  //   field: 'recieved_name',
  //   sortable: true,
  //   unSortIcon: true,
  //   headerName: '수취인명',
  //   minWidth: 120,
  // },
  // {
  //   field: 'recieved_addr',
  //   sortable: true,
  //   unSortIcon: true,
  //   headerName: '수취인 주소',
  //   minWidth: 140,
  // },
  // {
  //   field: 'recieved_phone',
  //   sortable: true,
  //   unSortIcon: true,
  //   headerName: '수취인 연락처',
  //   minWidth: 140,
  // },
];

// const getRowHeight = useCallback((params) => {
//   return params.data.rowHeight;
// }, []);

const rowHeight = 36;

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;
  const [mode, setMode] = useState(0);
  const [viewResult, setViewResult] = useState({});
  const [viewState, setView] = useState(true);
  const [platforms, setPlatforms] = useState([]);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [columnControlModalState, setColumnControlModalState] = useState(false);

  const [viewColumns, setViewColumns] = useState([]);
  //ag-grid
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      minWidth: 80,
      // wrapHeaderText: true,
      autoHeaderHeight: true,
    };
  }, []);
  const [columnDefs, setColumnDefs] = useState([]);

  const SetColumnDefsFunc = () => {
    if (!platforms[platformType]) return; // TODO Error
    if (!platforms[platformType].titles) return; // TODO Error

    const sella_codes = _.map(platforms[platformType].titles, 'sella_code');

    setColumnDefs(() =>
      _.filter(ROUTE_COLUMN_BASE, (base) => {
        if (base.field == '') return true;
        else if (base.field == 'profit_loss') return true;
        else if (base.field == 'forms_name') return true;
        else if (base.field == 'stock_price') return true;
        else if (base.field == 'delivery_fee') return true;
        else if (base.field == 'packing_fee') return true;

        return _.includes(sella_codes, Number(base.field));
      })
    );
  };

  useEffect(() => {
    // GO Step1
    const deliveryData = Recoils.getState('DATA:DELIVERY');
    const packingData = Recoils.getState('DATA:PACKING');

    if (!deliveryData || deliveryData.length == 1 || !packingData || packingData.length == 1) {
      modal.confirm(
        '초기 값을 설정해 주세요.',
        [{ strong: '', normal: '손익계산을 하시려면 기초정보, 상품정보를 등록해 주세요.' }],
        [
          {
            name: '기초정보 관리로 이동',
            callback: () => {
              navigate('step1');
            },
          },
        ]
      );

      return;
    }

    // GO Step2
    const goodsData = Recoils.getState('DATA:GOODS');

    if (!goodsData || goodsData.length == 0) {
      modal.confirm(
        '초기 값을 설정해 주세요.',
        [{ strong: '', normal: '손익계산을 하시려면 상품정보를 등록해 주세요.' }],
        [
          {
            name: '상품 관리로 이동',
            callback: () => {
              navigate('step2');
            },
          },
        ]
      );
      return;
    }

    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    if (!temp || temp.length == 0) {
      modal.confirm(
        '초기 값을 설정해 주세요.',
        [{ strong: '', normal: '손익계산을 하시려면 매체별 양식을 등록해 주세요.' }],
        [
          {
            name: '매체별 양식 관리로 이동',
            callback: () => {
              navigate('settlement/form_management');
            },
          },
        ]
      );

      return;
    }

    temp = _.sortBy(temp, ['_order']);
    setPlatforms(temp);
    //// 일단 하드코딩
    // request.post(`user/route_no`, { route_no: 0 }).then((ret) => {
    //   if (!ret.err) {
    //     const { data } = ret.data;
    //     logger.info(data);

    //     for (const row of data) {
    //       const findObj = _.find(ROUTE_COLUMN_BASE, { field: row.field });
    //       row.headerName = findObj.headerName;
    //     }

    //     setViewColumns(data);

    //     const field_arr = _.map(
    //       _.filter(data, (obj) => {
    //         return obj.select_flag == 1 || obj.select_flag == true;
    //       }),
    //       'field'
    //     );
    //     setColumnDefs(() =>
    //       _.filter(ROUTE_COLUMN_BASE, (base) => {
    //         if (base.field == '') return true;

    //         return _.includes(field_arr, base.field);
    //       })
    //     );
    //   }
    // });
  }, []);

  const onUpload = function () {
    setRowData([]);
    setViewResult({});

    SetColumnDefsFunc();

    modal.file_upload(null, '.xlsx', '파일 업로드', { platform: platforms[platformType] }, (ret) => {
      if (!ret.err) {
        const { files } = ret;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
          const bstr = e.target.result;
          const wb = xlsx.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });

          const titles = platforms[platformType].titles;

          const expected = {};

          for (const title of titles) {
            const header = title.title;

            const column = title.column;
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
                setMode(1);
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

  const onClick = () => {
    setModalState(true);
  };

  const onViewResult = () => {
    if (!rowData || !rowData.length) return;

    const unconnect_rows = _.filter(rowData, (data) => {
      return !data.connect_flag;
    });

    if (unconnect_rows.length != 0) {
      modal.confirm(
        '',
        [{ strong: '손익계산을 진행하기 전 미연결 주문건을 삭제하시겠습니까?', normal: '' }],
        [
          {
            name: '취소',
            callback: () => {},
          },
          {
            name: '미연결 주문건 삭제 후 손익계산',
            callback: () => {
              onDeleteUnconnectRow();
              const summary = CalcSummary(_.filter(rowData, { connect_flag: true }));

              setViewResult(summary);
            },
          },
        ]
      );
    } else {
      const summary = CalcSummary(rowData);

      setViewResult(summary);
    }
  };

  const onDeleteUnconnectRow = () => {
    const connect_rows = _.filter(rowData, (data) => {
      return data.connect_flag;
    });

    setRowData(connect_rows);
  };

  const onDownload = async () => {
    if (!rowData) return;
    if (!rowData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const columns = [];
    for (const column of columnDefs) {
      if (column.field == '') continue;

      const toAddedColumn = {};
      toAddedColumn.header = column.headerName;
      toAddedColumn.key = column.field;
      toAddedColumn.width = 20;

      columns.push(toAddedColumn);
    }
    worksheet.columns = columns;

    worksheet.addRows([...rowData]);

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    const time = moment().format('YYYYMMDDHHmmss');
    saveAs(blob, `주문서_${time}.xlsx`);
  };

  const onDelete = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const delete_arr = _.map(selectedRows, 'idx');
    setRowData(
      _.filter(rowData, (row) => {
        return !_.includes(delete_arr, row.idx);
      })
    );
  };

  const onSaveTodaySummary = () => {
    if (!rowData || !rowData.length) return;

    const unconnect_rows = _.filter(rowData, (data) => {
      return !data.connect_flag;
    });

    if (unconnect_rows.length != 0) {
      modal.confirm(
        '',
        [{ strong: '저장할 수 없습니다.', normal: '미연결 주문건이 있어서 저장할 수 없습니다.' }],
        [
          {
            name: '매칭하러 가기',
            callback: () => {
              setModalState(true);
            },
          },
          {
            name: '미연결 주문건 삭제 후 저장',
            callback: () => {
              onDeleteUnconnectRow();
              request.post(`user/today_summary/save`, { save_data: viewResult }).then((ret) => {
                if (!ret.err) {
                  const { data } = ret.data;
                  logger.info(data);

                  setRowData(() => data);
                }
              });
            },
          },
        ]
      );
    } else {
      request.post(`user/today_summary/save`, { save_data: viewResult }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          setRowData(() => data);
        }
      });
    }
  };

  const deleteCallback = (d) => {
    setRowData(
      _.filter(rowData, (item) => {
        return;
      })
    );
  };

  const saveCallback = (d) => {
    if (!d) return;

    setRowData(
      _.transform(
        rowData,
        function (result, item) {
          if (item.forms_product_name == d.forms_product_name && item.forms_option_name == d.forms_option_name) {
            item.connect_flag = true;

            item.stock_price = getStockPrice(d);
            item.delivery_fee = getDeliveryFee(d);
            item.packing_fee = getPackingFee(d);
            item.profit_loss = calcProfitLoss(d);
          }

          result.push(item);
        },
        []
      )
    );
  };

  const saveViewColumnsCallback = (viewColumns) => {
    const field_arr = _.map(
      _.filter(viewColumns, (obj) => {
        return obj.select_flag == 1 || obj.select_flag == true;
      }),
      'field'
    );
    setColumnDefs(() =>
      _.filter(ROUTE_COLUMN_BASE, (base) => {
        if (base.field == '') return true;

        return _.includes(field_arr, base.field);
      })
    );
  };

  const getRowStyle = (params) => {
    if (!params.node.data.connect_flag) {
      return { background: '#FFEAEA' };
    }
  };

  return (
    <>
      <Head />
      <Body title={`손익 계산`} myClass={'margin_calc'}>
        <SettlementNavTab active="/settlement/margin_calc" />

        {mode == 0 && (
          <>
            <div className="page before">
              <div className="section1">
                <h3>
                  주문서를 업로드하고 손익을 관리하세요!
                  <p>
                    오늘 들어온 주문, <span className="txt_red">순이익</span>은 얼마인가요?
                  </p>
                </h3>

                <div className="btnbox">
                  <DropdownButton variant="" title={platforms.length ? platforms[platformType].name : ''}>
                    {platforms &&
                      platforms.map(
                        (item, key) =>
                          item.view && (
                            <Dropdown.Item
                              key={key}
                              eventKey={key}
                              onClick={(e) => onChange(key, e)}
                              active={platformType === key}
                            >
                              {item.name}
                            </Dropdown.Item>
                          )
                      )}
                  </DropdownButton>
                  <Button variant="primary" onClick={onUpload} className="btn_green">
                    <img src={`/${icon_circle_arrow_up}`} />새 주문서 업로드
                  </Button>
                  <span>※ 신규 접수된 '배송준비중' 인 양식을 사용해주세요.</span>
                </div>

                <ul>
                  <li>판매 매체별 주문정보로 손익을 계산할 수 있습니다.</li>
                  <li>적자 상품을 찾아 판매 가격을 수정하세요.</li>
                  <li>오늘 업로드한 주문서를 모아서 하루동안 손익을 파악하세요.</li>
                </ul>
              </div>
              <div className="section2">
                <img src={`/${img_service}`} />
              </div>
            </div>
          </>
        )}
        {mode == 1 && (
          <>
            <div className="page after">
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
                  <img src={`/${icon_circle_arrow_up}`} />새 주문서 업로드
                </Button>

                <div className="btnbox">
                  <Button variant="primary" onClick={onDelete} className="btn_red">
                    선택 삭제
                  </Button>

                  <Button
                    disabled={!rowData || !rowData.length}
                    variant="primary"
                    onClick={onViewResult}
                    className="btn_blue"
                  >
                    손익 계산
                  </Button>

                  {/* TODO 색 고민 해봐야.. */}
                  <Button onClick={onSaveTodaySummary} disabled={_.isEmpty(viewResult)}>
                    주문서 저장
                  </Button>

                  <Button variant="primary" onClick={onDownload} className="btn_green" disabled={!rowData.length}>
                    <img src={`/${icon_circle_arrow_down}`} />
                    다운로드
                  </Button>

                  <Button
                    className="btn_set"
                    onClick={() => {
                      setColumnControlModalState(true);
                    }}
                  >
                    <img src={`/${icon_set}`} />
                  </Button>
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
                    rowSelection={'multiple'}
                    onRowDoubleClicked={onClick}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={'데이터가 없습니다.'}
                    suppressRowTransform={true}
                    rowHeight={rowHeight}
                    // getRowHeight={getRowHeight}
                  ></AgGridReact>
                </div>
              </div>
            </div>
          </>
        )}
      </Body>
      <Footer />
      <MarginCalc_UnConnectModal
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        unconnect_flag={true}
        deleteCallback={deleteCallback}
        saveCallback={saveCallback}
      ></MarginCalc_UnConnectModal>
      <ColumnControlModal
        modalState={columnControlModalState}
        setModalState={setColumnControlModalState}
        viewColumns={viewColumns}
        callback={saveViewColumnsCallback}
      ></ColumnControlModal>
    </>
  );
};
const calcProfitLoss = (profit_loss_row) => {
  let profit_loss = 0;
  profit_loss += getAggregation(profit_loss_row);
  profit_loss += getRealityDeliveryFee(profit_loss_row);
  profit_loss += getAssemblyFee(profit_loss_row);
  profit_loss += getInstallationFee(profit_loss_row);

  profit_loss -= getStockPrice(profit_loss_row);
  profit_loss -= getDeliveryFee(profit_loss_row);
  profit_loss -= getPackingFee(profit_loss_row);

  return profit_loss;
};

const getAggregation = (profit_loss_row) => {
  let aggregation = profit_loss_row[30001] ? Number(profit_loss_row[30001]) : 0;
  let profit_loss = 0;
  //  정산예정금액이 있는 경우
  if (aggregation) {
    profit_loss += aggregation; // 1. 정산예정금액 추가
  } else {
    // 없는 경우
    {
      aggregation = 0;
      aggregation += Number(profit_loss_row[30006]); // 1. 총 결제금액 더하기
      aggregation += Number(profit_loss_row[30019]); // 2. 기타할인1 빼기
      aggregation += Number(profit_loss_row[30020]); // 3. 기타할인2 빼기

      aggregation *= 1 - parseFloat(profit_loss_row.category_fee_rate) / 100;
    }

    profit_loss += aggregation;
  }

  return profit_loss;
};

const getRealityDeliveryFee = (profit_loss_row) => {
  let pay_advance = profit_loss_row[30022];
  let delivery_fee = 0;
  const received_delivery_fee = profit_loss_row[30047] ? Number(profit_loss_row[30047]) : 0;
  const countryside_added_fee = profit_loss_row[30014] ? Number(profit_loss_row[30014]) : 0;
  const df_discount = profit_loss_row[30015] ? Number(profit_loss_row[30015]) : 0;

  // 배송비 선불인 경우
  if (pay_advance) {
    delivery_fee += received_delivery_fee;
    delivery_fee += countryside_added_fee;
    delivery_fee -= df_discount;
    delivery_fee *= 1 - parseFloat(profit_loss_row['30047_additional']) / 100;
  }

  return delivery_fee;
};

const getAssemblyFee = (profit_loss_row) => {
  let assembly_fee = profit_loss_row[30032] ? Number(profit_loss_row[30032]) : 0;

  // 배송비 선불인 경우
  if (assembly_fee) {
    assembly_fee *= 1 - parseFloat(profit_loss_row['30032_additional']) / 100; // TODO 조립비 수수료.. 흠
  }

  return assembly_fee;
};

const getInstallationFee = (profit_loss_row) => {
  let installation_fee = profit_loss_row[30033] ? Number(profit_loss_row[30033]) : 0;

  // 배송비 선불인 경우
  if (installation_fee) {
    installation_fee *= 1 - parseFloat(profit_loss_row['30033_additional']) / 100; // TODO 설치비 수수료.. 흠
  }

  return installation_fee;
};

const getStockPrice = (profit_loss_row) => {
  return _.sumBy(profit_loss_row.goods_match, 'stock_price');
};

const getDeliveryFee = (profit_loss_row) => {
  return _.sumBy(profit_loss_row.goods_match, 'delivery_fee');
};

const getPackingFee = (profit_loss_row) => {
  return _.sumBy(profit_loss_row.goods_match, 'packing_fee');
};

const CalcSummary = (rowData) => {
  const unique_order_no = _.uniqBy(rowData, '30004');
  const unique_order_no_count = unique_order_no.length;
  const delivery_send = _.uniqBy(rowData, '30002');
  const delivery_send_count = delivery_send.length;
  const loss_order = _.filter(rowData, (row) => {
    return row.profit_loss < 0;
  });
  const loss_order_no_count = loss_order.length;
  const sum_payment_price = _.sumBy(rowData, '30006');
  const sum_received_delivery_fee = _.sumBy(rowData, '30047');
  const sum_profit_loss = _.sumBy(rowData, 'profit_loss');

  const summary = {
    forms_name: rowData[0].forms_name,
    unique_order_no_count: unique_order_no_count,
    delivery_send_count: delivery_send_count,
    loss_order_no_count: loss_order_no_count,
    sum_payment_price: sum_payment_price,
    sum_received_delivery_fee: sum_received_delivery_fee,
    sum_profit_loss: sum_profit_loss,
  };

  return summary;
};

export default React.memo(MarginCalc);
