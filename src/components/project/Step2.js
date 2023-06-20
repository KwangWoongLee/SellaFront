import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Step2Modal from 'components/project/Step2Modal';
import request from 'util/request';
import { modal, page_reload } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { logger } from 'util/com';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/Step2.scss';
let rawData;
const excel_str = [
  '신규 등록용',
  '상품정보 수집용(전체)',
  '상품정보 수집용(카테고리,상품명)',
  '상품정보 수집용(입고단가,택배비,포장비)',
];

const Step2 = () => {
  logger.render('Step2');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [rowData, setDatas] = useState();
  const [excelType, setExcelType] = useState(0);
  const [modalState, setModalState] = useState(false);
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

  useEffect(() => {
    request.post(`user/goods`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        rawData = _.cloneDeep(ret.data);
        setDatas(ret.data);
      }
    });
  }, []);

  const onCellValueChanged = (params) => {
    var column = params.column.colDef.field;
    if (rawData && rawData[params.node.rowIndex][column] && rawData[params.node.rowIndex][column] !== params.newValue) {
      params.column.colDef.cellStyle = { color: 'red' };
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    } else {
      var column = params.column.colDef.field;
      params.column.colDef.cellStyle = { color: 'black' };
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    }
  };

  const [columnDefs] = useState([
    { field: '', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', checkboxSelection: true, width: 5 },
    {
      field: 'idx',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '상품코드',
      filter: true,
    },
    { field: 'goods_category', sortable: true, headerName: '카테고리', filter: true },
    { field: 'name', sortable: true, unSortIcon: true, headerName: '상품명', filter: true },
    {
      field: 'stock_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '입고단가',
      filter: true,
    },
    {
      field: 'box_amount',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '박스입수량',
      filter: true,
    },
    {
      field: 'single_delivery',
      sortable: true,
      unSortIcon: true,
      headerName: '단독배송',
      filter: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N'],
      },
    },
    { field: 'barcode', sortable: true, unSortIcon: true, headerName: '바코드', filter: true },
    { field: 'rrp', sortable: true, unSortIcon: true, headerName: '권장소비자가', filter: true },
    { field: 'memo', sortable: true, unSortIcon: true, headerName: '메모', filter: true },
    { field: 'reg_date', sortable: true, unSortIcon: true, headerName: '최종 수정일', filter: true, editable: false },
    {
      field: 'modify_date',
      sortable: true,
      unSortIcon: true,
      headerName: '최종 등록일',
      filter: true,
      editable: false,
    },
  ]);

  const onDelete = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedIdxs = _.map(selectedRows, 'idx');

      request.post(`user/goods/delete`, { aidx, idxs: selectedIdxs }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          rawData = _.cloneDeep(ret.data);
          setDatas(ret.data);
        }
      });
    }
  };

  const onSave = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      request.post(`user/goods/modify`, { aidx, selectedRows }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          page_reload();
        }
      });
    }
  };

  const onInsert = (e) => {
    setModalState(true);
  };

  const PageCallback = (newRow) => {
    if (newRow) {
      rawData = _.cloneDeep([newRow, ...rowData]);
      setDatas([newRow, ...rowData]);
    }
  };

  const onUpload = function () {
    modal.file_upload('user/goods/save', '.xlsx', '파일 업로드', { aidx, excelType }, (ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        rawData = _.cloneDeep(ret.data);
        setDatas(ret.data);
      }
    });
  };

  const onDownload = async (type, e) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('상품입고용');

    worksheet.columns = [
      { header: '상품번호', key: 'idx', width: 10 },
      { header: '카테고리', key: 'goods_category', width: 32 },
      { header: '입고단가', key: 'stock_price', width: 10, outlineLevel: 1 },
    ];

    // const columnData = [];
    const columnData = _.cloneDeep(rawData);
    _.map(columnData, (obj) => {
      _.unset(obj, 'reg_date');
      _.unset(obj, 'modify_date');
    });
    // const columns = [
    //   ['상품번호', '카테고리', '상품명', '입고단가', '박스입수량', '단독배송', '바코드', '권장소비자가', '메모'],
    //   ..._.map(columnData, (obj) => _.values(obj)),
    // ];
    // const ws = xlsx.utils.json_to_sheet(columns, { skipHeader: true });
    // const wb = xlsx.utils.book_new();
    // xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    // xlsx.writeFile(wb, `상품저장기본양식.xlsx`);

    const rows = [{ idx: 2, goods_category: 'Jane Doe', stock_price: 123 }];
    worksheet.addRows(rows);

    worksheet.getColumn('A').protection = {
      locked: true,
      lockText: true,
    };

    await worksheet.protect('', { selectLockedCells: false, selectUnlockedCells: true });
    // 다운로드
    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    saveAs(blob, '상품저장기본양식.xlsx');
  };

  const onChange = (key, e) => {
    setExcelType(key);
  };

  return (
    <>
      <Head />
      <Body title={`Step2`}>
        <div className="page">
          <Button variant="primary" onClick={onDelete}>
            선택 삭제
          </Button>{' '}
          <Button variant="primary" onClick={onSave}>
            선택 저장
          </Button>{' '}
          <Button variant="primary" onClick={onInsert}>
            상품 추가
          </Button>{' '}
          <DropdownButton variant="" title={excel_str[excelType]}>
            {excel_str.map((name, key) => (
              <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={excelType === key}>
                {excel_str[key]}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <Button variant="primary" onClick={onUpload}>
            상품 엑셀 업로드
          </Button>{' '}
          <Button variant="primary" onClick={onDownload}>
            상품 엑셀 다운로드
          </Button>
          <div style={containerStyle}>
            <div style={gridStyle} className="ag-theme-alpine test">
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={true}
                alwaysShowVerticalScroll={true}
                defaultColDef={defaultColDef}
                rowSelection={'multiple'}
                onCellEditingStopped={onCellValueChanged}
              ></AgGridReact>
            </div>
          </div>
        </div>
      </Body>
      <Footer />

      <Step2Modal modalState={modalState} setModalState={setModalState} callback={PageCallback}></Step2Modal>
    </>
  );
};

export default React.memo(Step2);
