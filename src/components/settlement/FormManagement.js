import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import FormManagementNavTab from 'components/settlement/common/FormManagementNavTab';
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

  const [formsData, setFormsDatas] = useState([]);
  const [formMode, setFormMode] = useState(0);
  const [nextForm, setNextForm] = useState(null);
  let platformRef = useRef(null);

  useEffect(() => {
    let platforms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
    platforms = _.sortBy(platforms, ['_order']);

    platformRef.current = [...platforms];

    setFormsDatas([...platformRef.current]);
  }, []);

  useEffect(() => {
    if (gridRef.current.api) {
      const row0 = gridRef.current.api.getRowNode(0);
      row0.setSelected(true);
    }
  }, [formsData]);

  // ag-grid
  const gridRef = useRef();
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

  const ButtonRenderer = (props) => {
    const buttonClicked = () => {
      if (props.data.idx == -1) {
        modal.alert('추가중인 양식 저장 먼저 해주세요.');
        return;
      }

      request.post(`user/forms/save_view`, { idx: props.data.idx, view: !props.value }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          const platforms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
          const findObj = _.find(platforms, { idx: props.data.idx });
          findObj.view = !props.value ? 1 : 0;

          Recoils.setState('DATA:PLATFORMS', platforms);
          props.setValue(!props.value);
        }
      });
    };

    const v = props.value ? 'on' : 'off';
    return <button onClick={() => buttonClicked()} className={'btn_onoff btn_' + v}></button>;
  };

  const [columnDefs] = useState([
    {
      field: 'idx',
      headerName: 'idx',
      hide: true,
      cellClass: 'uneditable',
    },
    {
      field: '',
      maxWidth: 38,
      rowDrag: true,
      cellClass: 'uneditable',
    },
    {
      field: 'name',
      headerName: '양식명',
      width: 220,
      cellClass: 'uneditable',
    },
    {
      field: 'view',
      headerName: 'on/off',
      cellRenderer: ButtonRenderer,
      maxWidth: 73,
      cellClass: 'uneditable',
    },
  ]);

  const rowHeight = 42;

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

    const unRegistObj = _.find(datas, (data) => {
      return data.idx == -1;
    });

    if (unRegistObj) {
      modal.alert('추가중인 양식 저장 먼저 해주세요.');
      return;
    }

    request.post(`user/forms/save_order`, { datas }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        // Recoils.setState('DATA:PLATFORMS', ret.data.forms);
        const platforms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
        for (const d of datas) {
          const findObj = _.find(platforms, { idx: d.idx });
          findObj._order = d._order;
        }

        Recoils.setState('DATA:PLATFORMS', platforms);
      }
    });
  };

  const onAddForm = () => {
    // 한개 추가
    const new_form = { name: '새 매체 양식', basic_form_flag: 0, idx: -1 };

    const platforms = platformRef.current;
    if (platforms) {
      platforms.unshift(new_form);
    }

    setFormsDatas([...platformRef.current]);
  };

  const onDelete = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];

    modal.confirm(
      `${node.name} 양식을 삭제하시겠습니까?`,
      [{ strong: '다시 복원할 수 없습니다.', normal: '' }],
      [
        {
          name: '삭제',
          callback: () => {
            if (node.idx == -1) {
              setFormsDatas(_.drop(formsData, 1));

              if (platformRef.current) {
                platformRef.current = _.drop(platformRef.current, 1);
              }

              return;
            }

            request.post(`user/forms/delete`, { forms_idx: node.idx }).then((ret) => {
              if (!ret.err) {
                const { data } = ret.data;
                logger.info(data);

                let platforms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
                platforms = _.filter(platforms, (i) => i.idx != node.idx);

                Recoils.setState('DATA:PLATFORMS', platforms);
                Recoils.setState('DATA:FORMSMATCH', data.forms_match_result);
                Recoils.setState('DATA:GOODSMATCH', data.goods_match_result);

                setFormsDatas(platforms);
              }
            });
          },
        },

        {
          name: '취소',
          callback: () => {},
        },
      ]
    );
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
        <FormManagementNavTab active="/settlement/form_management" />
        <div className="page">
          <div className="section1">
            <h3>판매매체</h3>
            <Button variant="primary" onClick={onSaveOrder}>
              순서 저장
            </Button>
            <div className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                rowData={formsData}
                columnDefs={columnDefs}
                alwaysShowHorizontalScroll={false}
                alwaysShowVerticalScroll={false}
                defaultColDef={defaultColDef}
                rowSelection="single"
                rowDragManaged={true}
                animateRows={true}
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                rowHeight={rowHeight}
              ></AgGridReact>
            </div>
            <div className="btnbox">
              <Button variant="primary" onClick={onAddForm} className="btn_blue">
                사용자 양식 추가
              </Button>
              {formMode != 1 && (
                <Button variant="primary" className="btn_red" onClick={onDelete}>
                  선택 양식 삭제
                </Button>
              )}
            </div>
          </div>
          <div className="section2">{formMode == 1 && <FormManagement_Basic platform={nextForm} />}</div>
          <div className="section3">{formMode == 2 && <FormManagement_Custom platform={nextForm} />}</div>
          <div className="section3">{formMode == 3 && <FormManagement_Custom_Add platform={nextForm} />}</div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(FormManagement);
