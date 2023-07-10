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
//

import 'styles/Step2.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';
import Step2_DFCellRenderer from 'components/project/Step2_DFCellRenderer';
import Step2_PFCellRenderer from 'components/project/Step2_PFCellRenderer';

let rawData;
const excel_str = [
  '신규 등록용',
  '상품정보 수집용(전체)',
  '상품정보 수집용(카테고리,상품명)',
  '상품정보 수집용(입고단가,택배비,포장비)',
];
let df_category = [];
let pf_category = [];

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
    if (!df_category.length)
      request.post(`user/delivery`, { aidx }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          if (ret.data.length > 1) {
            df_category = ret.data;
            df_category.push({ delivery_category: '기타' });
          }
        }
      });

    if (!pf_category.length)
      request.post(`user/packing`, { aidx }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          if (ret.data.length > 1) {
            pf_category = ret.data;
            pf_category.push({ packing_category: '기타', packing_fee: 0 });
          }
        }
      });

    request.post(`user/goods`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        rawData = _.cloneDeep(ret.data);
        setDatas(ret.data);
      }
    });
  }, []);

  const onCellValueChanged = (params) => {
    let column = params.column.colDef.field;
    if (rawData && rawData[params.node.rowIndex][column] && rawData[params.node.rowIndex][column] !== params.newValue) {
      const newStyle = { color: 'red' };
      params.column.colDef.cellStyle = newStyle;
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    } else {
      let column = params.column.colDef.field;
      const newStyle = { color: 'black' };
      params.column.colDef.cellStyle = newStyle;
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    }
  };

  const [columnDefs] = useState([
    {
      editable: false,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      cellClass: 'lock-pinned',
      pinned: 'left',
      lockPinned: true,
      maxWidth: 30,
      cellClass: 'checkcell',
    },
    {
      field: 'idx',
      headerName: '상품코드',
      sortable: true,
      editable: false,
      filter: false,
      cellClass: 'lock-pinned',
      pinned: 'left',
      lockPinned: true,
      width: 120,
      cellClass: 'codecell',
    },
    {
      field: 'goods_category',
      headerName: '카테고리',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable lock-pinned',
      pinned: 'left',
      lockPinned: true,
      width: 120,
    },
    {
      field: 'name',
      headerName: '상품명',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable lock-pinned prd_name',
      pinned: 'left',
      lockPinned: true,
      width: 250,
    },
    {
      field: 'stock_price',
      headerName: '입고단가',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      filter: false,
      cellDataType: 'number', // 인풋 타입을 넘버로 바꾸고싶어요ㅠㅠ
      cellClass: 'ag-cell-editable',
      maxWidth: 90,
    },
    {
      field: 'delivery_fee',
      headerName: '택배비',
      sortable: true,
      unSortIcon: true,
      filter: false,
      // cellDataType: 'number', // 인풋 타입을 넘버로 바꾸고싶어요ㅠㅠ , project 폴더에 Step2_PopupCellRenderer 쪽에서 input있는데 컨트롤 하시면됩니다^^
      editable: false,
      // cellClass: 'ag-cell-editable',
      cellRenderer: Step2_DFCellRenderer,
      cellRendererParams: {
        df_category,
        rawData,
      },
      minWidth: 210,
    },
    {
      field: 'packing_fee',
      headerName: '포장비',
      sortable: true,
      unSortIcon: true,
      filter: false,
      editable: false,
      // cellClass: 'ag-cell-editable',
      cellRenderer: Step2_PFCellRenderer,
      cellRendererParams: {
        pf_category,
        rawData,
      },
      minWidth: 205,
    },
    {
      field: 'stock_price',
      headerName: '입고단가',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      filter: false,
      cellClass: 'ag-cell-editable',
    },
    {
      field: 'box_amount',
      headerName: '박스입수량',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      filter: false,
      cellClass: 'ag-cell-editable',
    },
    {
      field: 'single_delivery',
      headerName: '단독배송',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellEditor: 'agSelectCellEditor',
      cellClass: 'ag-cell-editable',
      cellEditorParams: {
        values: ['Y', 'N'],
      },
    },
    {
      field: 'barcode',
      headerName: '바코드',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable',
    },
    {
      field: 'rrp',
      headerName: '권장소비자가',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable',
    },
    {
      field: 'memo',
      headerName: '메모',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable',
    },
    { field: 'reg_date', headerName: '최종 수정일', sortable: true, unSortIcon: true, filter: false, editable: false },
    {
      field: 'modify_date',
      headerName: '최종 등록일',
      sortable: true,
      unSortIcon: true,
      filter: false,
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
    modal.file_upload('user/goods/save', '.xlsx', '상품정보 엑셀 파일을 선택해주세요.', { aidx, excelType }, (ret) => {
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
      <Body title={`Step2`} myClass={'step2'}>
        <div className="page">
          <div className="btnbox_left">
            <Button variant="primary" onClick={onDelete} className="btn_red">
              선택 삭제
            </Button>{' '}
            <Button variant="primary" onClick={onSave} className="btn_blue">
              선택 저장
            </Button>{' '}
            <Button variant="primary" onClick={onInsert}>
              상품 추가
            </Button>{' '}
            <p class="prdcount">
              전체 상품 <span>2000</span> 개
            </p>
          </div>
          <div className="btnbox_right">
            <Button variant="primary" onClick={onUpload} className="btn_green">
              <img src={icon_circle_arrow_up} />
              상품 엑셀 업로드
            </Button>{' '}
            <DropdownButton variant="" title={excel_str[excelType]}>
              {excel_str.map((name, key) => (
                <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={excelType === key}>
                  {excel_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Button variant="primary" onClick={onDownload} className="btn_green">
              <img src={icon_circle_arrow_down} />
              상품 엑셀 다운로드
            </Button>
            <Button className="btn_set">
              <img src={icon_set} />
            </Button>
          </div>
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
                onCellEditingStopped={onCellValueChanged}
                singleClickEdit={true}
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
