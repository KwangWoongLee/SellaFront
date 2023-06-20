import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import { logger } from 'util/com';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/FormManagement.scss';

const FormManagement = () => {
  logger.render('FormManagement');

  const [info, setInfo] = useState(null);
  const [rowData, setDatas] = useState();

  useEffect(() => {}, []);

  // ag-grid
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
      field: 'title',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '양식명',
      filter: true,
    },
  ]);

  //

  const onSaveOrder = () => {};

  const onAddForm = () => {};

  return (
    <>
      <Head />
      <Body title={`매체별 양식관리`}>
        <SettlementNavTab active="/settlement/form_management" />
        <div className="form_management left">
          판매매체
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
              ></AgGridReact>
            </div>
          </div>
          <Button variant="primary" onClick={onSaveOrder}>
            순서 저장
          </Button>{' '}
          <Button variant="primary" onClick={onAddForm}>
            사용자 양식 추가
          </Button>
        </div>
        <div className="form_management right">양식확인</div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(FormManagement);
