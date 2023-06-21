import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/SettlementNavTab';
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

  const [info, setInfo] = useState(null);
  const [formsData, setFormsDatas] = useState([]);
  const [basicFormData, setBasicFormDatas] = useState([]);
  const formNameRef = useRef(null);
  const [formSaveData, setFormSaveData] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [excelData, setExcelData] = useState([]);

  useEffect(() => {
    request.post(`user/forms`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        setFormsDatas(ret.data);

        if (ret.data.length && ret.data[0].titles) {
          const nowForm = ret.data[0].titles;
          formNameRef.current.value = ret.data[0].name;
          setFormSaveData(nowForm);
        } else setFormSaveData([]);
      }
    });

    request.post(`user/basic_forms`, {}).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        setBasicFormDatas(ret.data);
      }
    });
  }, []);

  // ag-grid
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '50%', height: '50%' }), []);
  const gridStyle = useMemo(() => ({ height: '50%', width: '50%' }), []);
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

  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const node = selectedRows[0];
    const name = node.name;
    formNameRef.current.value = name;

    setFormSaveData(node.titles);
  }, []);

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

    setFormsDatas([{ name: '새 매체 양식' }, ...formsData]);

    formNameRef.current.value = '새 매체 양식';
    setFormSaveData(_.filter(basicFormData, { essential: 1 }));
  };
  const onSaveForm = () => {};
  const onAddSellaBasic = () => {
    setModalState(true);
  };

  const onUpload = function () {
    modal.file_upload(null, '.xlsx', '파일 업로드', {}, (ret) => {
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

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          for (const key in ws) {
            const prevlast = key[key.length - 2];
            const last = key[key.length - 1];

            if (isNaN(prevlast) && !isNaN(last) && Number(last) === 1) {
              const column = key.slice(0, key.length - 1);
              const header = ws[key]['h'];
              let v = '-';
              if (ws[column + '2']) v = ws[column + '2']['w'];

              items.push({ column, header, value: v });
            }
          }

          setExcelData(items);
        };

        if (rABS) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`매체별 양식관리`}>
        <SettlementNavTab active="/settlement/form_management" />
        <div className="form_management">
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
                rowSelection="single"
                rowDragManaged={true}
                animateRows={true}
                onSelectionChanged={onSelectionChanged}
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
        <div className="form_management">
          <span>
            매체명
            <input type={'text'} ref={formNameRef}></input>
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
              {formSaveData && formSaveData.map((d, key) => <SellaForm key={d.idx} index={key} d={d} />)}
              <></>
            </tbody>
          </table>
          <Button variant="primary" onClick={onAddSellaBasic}>
            항목 추가
          </Button>
        </div>

        <div className="form_management">
          <Button variant="primary" onClick={onUpload}>
            주문 양식 업로드
          </Button>
          <table className="section">
            <caption></caption>
            <thead>
              <th>열</th>
              <th>업로드한 엑셀 항목</th>
              <th></th>
            </thead>
            <tbody>
              {excelData && excelData.map((d, key) => <UploadExcelItems key={key} index={key} d={d} />)}
              <></>
            </tbody>
          </table>
        </div>
      </Body>
      <Footer />
      <SellaBasicModal
        modalState={modalState}
        setModalState={setModalState}
        basicFormData={basicFormData}
      ></SellaBasicModal>
    </>
  );
};

const SellaForm = React.memo(({ index, d }) => {
  logger.render('SellaForm TableItem : ', index);
  return (
    <tr>
      <td>
        {d.title} {d.essential ? '*' : ''}
      </td>
      {d.data ? (
        <>
          <td>
            {d.data.title}
            {' ('}
            {d.data.column}
            {'열)'}
          </td>
        </>
      ) : (
        <>클릭하여</>
      )}
    </tr>
  );
});

const UploadExcelItems = React.memo(({ index, d }) => {
  logger.render('SellaForm TableItem : ', index);
  return (
    <tr>
      <td>{d.column}</td>

      <td>
        {d.header}
        <br />
        {d.value}
      </td>
      <td>
        <Button>선택</Button>
      </td>
    </tr>
  );
});

const SellaBasicModal = React.memo(({ modalState, setModalState, basicFormData }) => {
  logger.render('SellaBasicModal');
  const columnList = _.filter(basicFormData, { essential: 0 });

  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Body>
        {columnList &&
          columnList.map((d, key) => (
            <Button key={key} index={key}>
              {d.title}
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(FormManagement);
