import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import FormManagement_Basic from 'components/settlement/FormManagement_Basic';
import FormManagement_Custom from 'components/settlement/FormManagement_Custom';
import FormManagement_Custom_Add from 'components/settlement/FormManagement_Custom_Add';
import * as xlsx from 'xlsx';

import { logger } from 'util/com';
import _ from 'lodash';

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

  const [formsData, setFormsDatas] = useState([]);
  const [formMode, setFormMode] = useState(0);
  const [nextForm, setNextForm] = useState(null);
  let platformRef = useRef(null);

  useEffect(() => {
    let platforms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
    platformRef.current = [...platforms];

    setFormsDatas([...platformRef.current]);
  }, []);

  // ag-grid
  const gridRef = useRef();
  // const containerStyle = useMemo(() => ({ width: '50%', height: '50%' }), []);
  // const gridStyle = useMemo(() => ({ height: '50%', width: '50%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      resizable: false,
      flex: 1,
      lockPinned: true,
      pinned: 'left',
      cellClass: 'lock-pinned',
      editable: false,
      sortable: false,
    };
  }, []);

  const [columnDefs] = useState([
    {
      field: 'idx',
      headerName: 'idx',
      hide: true,
    },
    {
      field: '',
      maxWidth: 50,
      rowDrag: true,
    },
    {
      field: 'name',
      headerName: '양식명',
    },
    // view 필요없는 셀 >>> 지우고 싶어요 ㅎㅎ
    {
      field: 'view',
      headerName: '필요없는 셀',
      hide: true,
    },
  ]);

  const onSelectionChanged = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];

    const basic_form_flag = node.basic_form_flag;
    const platforms = platformRef.current;
    const platform = _.find(platforms, { basic_form_flag: basic_form_flag, idx: node.idx });
    setNextForm({ ...platform });

    if (basic_form_flag == true) {
      setFormMode(1);
    } else {
      platform.idx != -1 ? setFormMode(2) : setFormMode(3);
    }
  };

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

  const onAddForm = () => {
    // 한개 추가
    const new_form = { name: '새 매체 양식', basic_form_flag: 0, idx: -1 };

    const platforms = platformRef.current;
    if (platforms) {
      platforms.unshift(new_form);
      // const row0 = gridRef.current.api.getRowNode(0);
      // row0.setSelected(true);
      // platformRef.current = platforms;
    }

    setFormsDatas([...platformRef.current]);
  };

  const onGridReady = () => {
    if (formsData) {
      const row0 = gridRef.current.api.getRowNode(0);
      if (row0) row0.setSelected(true);
    }
  };

  return (
    <>
      <Head />
      <Body title={`매체별 양식관리`} myClass={'form_management'}>
        <SettlementNavTab active="/settlement/form_management" />
        <div className="page">
          <div className="section1">
            <h3>판매매체</h3>
            <div className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                rowData={formsData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={true}
                alwaysShowVerticalScroll={true}
                defaultColDef={defaultColDef}
                rowSelection="single"
                rowDragManaged={true}
                animateRows={true}
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
              ></AgGridReact>
            </div>
            <div className="btnbox">
              <Button variant="primary" onClick={onSaveOrder}>
                순서 저장
              </Button>{' '}
              <Button variant="primary" onClick={onAddForm} className="btn_blue">
                사용자 양식 추가
              </Button>
            </div>
          </div>
          <div className="section2">{formMode == 1 && <FormManagement_Basic platform={nextForm} />}</div>
          <div className="section3">{formMode == 2 && <FormManagement_Custom platform={nextForm} />}</div>
          <div className="section4">{formMode == 3 && <FormManagement_Custom_Add platform={nextForm} />}</div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(FormManagement);
