import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import request from 'util/request';
import { modal, page_reload } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

// AG Grid
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/Step2.scss';
import 'styles/Step2.css';
let rawData;

const Step2 = () => {
  logger.render('Step2');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [rowData, setDatas] = useState();
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
    { field: 'single_delivery', sortable: true, unSortIcon: true, headerName: '단독배송', filter: true },
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

  const onUpload = function () {
    modal.file_upload('user/goods/save', '.xlsx', '파일 업로드', { aidx }, (ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        rawData = _.cloneDeep(ret.data);
        setDatas(ret.data);
      }
    });
  };

  const onDownload = (type, e) => {};

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
          <Button variant="primary" onClick={onUpload}>
            상품 엑셀 업로드
          </Button>{' '}
          <Button variant="primary" onClick={onDownload}>
            전체 상품 다운로드
          </Button>
          <div style={containerStyle}>
            <div style={gridStyle} className="ag-theme-alpine">
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
    </>
  );
};

export default React.memo(Step2);
