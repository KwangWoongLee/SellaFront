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

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import ColumnControlModal from 'components/common/AgGrid/ColumnControlModal';
const PLFormatter = (params) => {
  let newValue = '';
  newValue += params.value > 0 ? '이익' : '손해';
  newValue += params.value;
  return newValue;
};

//
const ROUTE_COLUMN_BASE = [
  { field: 'idx', hide: true },
  { field: '', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', checkboxSelection: true, width: 5 },
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
    field: 'payment_date',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned',
    editable: false,
    headerName: '결제일',
    filter: false,
    unSortIcon: true,
    width: 120,
  },

  { field: 'order_no', sortable: true, unSortIcon: true, headerName: '주문번호', minWidth: 160 },
  {
    field: 'forms_name',
    sortable: true,
    unSortIcon: true,
    headerName: '매체',
    minWidth: 120,
  },
  {
    field: 'forms_product_name',
    sortable: true,
    unSortIcon: true,
    headerName: '판매상품명',
    minWidth: 400,
    wrapText: true,
    vertical: 'Center',
  },
  {
    field: 'forms_option_name1',
    sortable: true,
    unSortIcon: true,
    headerName: '옵션',
    minWidth: 300,
    wrapText: true,
    vertical: 'Center',
  },
  {
    field: 'count',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '주문수량',
    minWidth: 100,
  },
  {
    field: 'sum_payment_price',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '총 결제금액(정산예정금액)',
    minWidth: 140,
  },

  {
    field: 'recieved_delivery_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '받은 배송비',
    minWidth: 140,
  },
  {
    field: 'stock_price',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '입고단가',
    minWidth: 120,
  },
  {
    field: 'delivery_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '배송비',
    minWidth: 100,
  },
  {
    field: 'packing_fee',
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '포장비',
    minWidth: 100,
  },
  {
    field: 'recieved_name',
    sortable: true,
    unSortIcon: true,
    headerName: '수취인명',
    minWidth: 120,
  },
  {
    field: 'recieved_addr',
    sortable: true,
    unSortIcon: true,
    headerName: '수취인 주소',
    minWidth: 140,
  },
  {
    field: 'recieved_phone',
    sortable: true,
    unSortIcon: true,
    headerName: '수취인 연락처',
    minWidth: 140,
  },
];

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;
  const [viewResult, setViewResult] = useState(false);
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
      resizable: true,
      flex: 1,
      minWidth: 80,
      autoHeight: true,
    };
  }, []);
  const [columnDefs, setColumnDefs] = useState([]);

  useEffect(() => {
    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    temp = _.sortBy(temp, ['_order']);
    setPlatforms(temp);
    //일단 하드코딩
    request.post(`user/route_no`, { aidx, route_no: 0 }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        for (const row of ret.data) {
          const findObj = _.find(ROUTE_COLUMN_BASE, { field: row.field });
          row.headerName = findObj.headerName;
        }

        setViewColumns(ret.data);

        const field_arr = _.map(
          _.filter(ret.data, (obj) => {
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
      }
    });
  }, []);

  const onUpload = function () {
    setRowData([]);
    setViewResult(false);

    modal.file_upload(null, '.xlsx', '파일 업로드', { aidx, platform: platforms[platformType] }, (ret) => {
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
          frm.append('aidx', aidx);
          frm.append('platform', JSON.stringify(platforms[platformType]));

          request
            .post_form('settlement/profit_loss', frm, () => {})
            .then((ret) => {
              if (!ret.err) {
                setRowData(() => ret.data);
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

    setViewResult(true);
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
    // TODO : 시간포함
    saveAs(blob, '주문서다운로드.xlsx');
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
          if (item.forms_product_name == d.forms_product_name && item.forms_option_name1 == d.forms_option_name1)
            item.connect_flag = true;
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
      return { background: 'red' };
    }
  };

  return (
    <>
      <Head />
      <Body title={`손익 계산`} myClass={'margin_calc'}>
        <SettlementNavTab active="/settlement/margin_calc" />

        {viewState ? (
          <div className="page">
            <div className="btnbox">
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
                <img src={icon_circle_arrow_up} />새 주문서 업로드
              </Button>

              <Button variant="primary" onClick={onDelete} className="btn_red">
                선택 삭제
              </Button>

              <Button variant="primary" onClick={onViewResult} className="btn_blue">
                손익 계산
              </Button>

              {/* TODO 색 고민 해봐야.. */}
              <Button onClick={onUpload} disabled={viewResult ? false : true}>
                주문서 저장
              </Button>

              <Button variant="primary" onClick={onDownload} className="btn_green">
                <img src={icon_circle_arrow_down} />
                다운로드
              </Button>

              <Button
                className="btn_set"
                onClick={() => {
                  setColumnControlModalState(true);
                }}
              >
                <img src={icon_set} />
              </Button>
            </div>

            <ul className={viewResult ? 'viewbox' : 'viewbox off'}>
              <li>
                <p className="dt">총 주문</p>
                <p className="dd">
                  999,999
                  <span>건</span>
                </p>
              </li>
              <li>
                <p className="dt">택배 발송</p>
                <p className="dd">
                  999,999
                  <span>건</span>
                </p>
              </li>
              <li>
                <p className="dt">적자 주문</p>
                <span className="dd txt_red">
                  9<span className="unit txt_red">건</span>
                </span>
              </li>
              <li>
                <p className="dt">상품 결제 금액</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
              <li>
                <p className="dt">받은 배송비</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
              {/* 손익합계 <li> className에 이익일때 profit, 손해일때 loss 넣어주세요. */}
              {/* 이 작업도 손익 계산이 다끝나면 하게 될 것 같아요! */}
              <li className="loss">
                <p className="dt">손익 합계</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
            </ul>
            {/* 표가 미어있일 경우에 'NO Rows To Show' 라고 쓰여있는데 다른 텍스트를 넣을 수 있을까요? */}
            {/* 아래 데이터가 없습니다 부분에 어떤 말을 넣고 싶으신지 입력해주시면 되세요^^ */}
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
                ></AgGridReact>
              </div>
            </div>
          </div>
        ) : (
          <Modal show={!viewState} centered className="Confirm">
            {<Modal.Title className="text-primary">{'초기 값을 설정해 주세요.'}</Modal.Title>}
            손익을 계산하시려면 기초정보, 상품정보를 등록 해주세요.
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step1');
              }}
            >
              기초정보 관리로 이동
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step2');
              }}
            >
              상품 관리로 이동
            </Button>
          </Modal>
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

export default React.memo(MarginCalc);
