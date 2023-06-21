import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
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

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [info, setInfo] = useState(null);
  const [formsData, setFormsDatas] = useState([]);

  useEffect(() => {
    request.post(`user/forms`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        setFormsDatas(ret.data);
      }
    });
  }, []);

  // ag-grid
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '10%', height: '10%' }), []);
  const gridStyle = useMemo(() => ({ height: '10%', width: '10%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  const onChange = () => {
    console.log('here');
  };

  const [columnDefs] = useState([
    {
      field: 'idx',
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: 'idx',
      hide: true,
    },
    {
      field: '',
      pinned: 'left',
      lockPinned: true,
      width: 10,
      rowDrag: true,
      editable: true,
      sortable: false,
      checkboxSelection: (params) => {
        return true;
      },
    },
    {
      field: 'name',
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '양식명',
    },
  ]);

  const onSaveOrder = () => {
    const datas = [];
    gridRef.current.api.forEachNode((rowNode, index) => {
      rowNode.data._order = index;

      datas.push({ ...rowNode.data });
    });

    request.post(`user/forms/save_order`, { aidx, datas }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        ret.data.length ? setFormsDatas(() => ret.data) : setFormsDatas([]);
      }
    });
  };

  const onAddForm = () => {};
  const onSaveForm = () => {};

  return (
    <>
      <Head />
      <Body title={`매체별 양식관리`}>
        <SettlementNavTab active="/settlement/form_management" />
        {/* <div className="form_management">
          판매매체
          <div style={containerStyle}>
            <div style={gridStyle} className="ag-theme-alpine test">
              <AgGridReact
                ref={gridRef}
                rowData={formsData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={true}
                alwaysShowVerticalScroll={true}
                defaultColDef={defaultColDef}
                rowSelection="multiple"
                rowDragManaged={true}
                animateRows={true}
              ></AgGridReact>
            </div>
          </div>
          <Button variant="primary" onClick={onSaveOrder}>
            순서 저장
          </Button>{' '}
          <Button variant="primary" onClick={onAddForm}>
            사용자 양식 추가
          </Button>
        </div> */}
        <div className="form_management">
          <span>
            매체명
            <input></input>
          </span>
          <Button variant="primary" onClick={onSaveForm}>
            양식 저장
          </Button>
          <table className="section">
            <caption></caption>
            <thead>
              <th>셀라 표준 항목</th>
              <th>선택한 엑셀 항목</th>
            </thead>
            <tbody>
              {formsData && formsData.map((d, key) => <SellaForm key={key} index={key} d={d} />)}
              <tr>
                <td>1</td>
                <td>2</td>
              </tr>
              <></>
            </tbody>
          </table>
        </div>
      </Body>
      <Footer />
    </>
  );
};

const SellaForm = React.memo(({ index, d }) => {
  logger.render('SellaForm TableItem : ', index);
  return (
    <tr>
      <td>{d.name}</td>

      <td>
        <Button>hi</Button>
      </td>
    </tr>
  );
});

export default React.memo(FormManagement);
