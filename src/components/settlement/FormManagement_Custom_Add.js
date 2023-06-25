import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import * as xlsx from 'xlsx';

import { logger } from 'util/com';
import _ from 'lodash';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/FormManagement.scss';

const FormManagement_Custom_Add = (param) => {
  logger.render('FormManagement_Custom_Add');

  const [rowData, setRowData] = useState([]);
  let { platform } = param;

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const sella_forms = Recoils.useValue('SELLA:SELLAFORMS');

  const formNameRef = useRef(null);
  const [modalState, setModalState] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const excelDataRef = useRef(null);
  const nowSelectRef = useRef(null);

  useEffect(() => {
    formNameRef.current.value = platform.name;
    const rowDatas = [];

    const essential_forms = _.filter(sella_forms, { essential_flag: 1 });
    for (const sella_form of essential_forms) {
      const row_data = {};
      row_data.sella_title = sella_form.title;
      row_data.sella_essential = sella_form.essential_flag;
      row_data.sella_code = sella_form.code;
      rowDatas.push(row_data);
    }

    setRowData(rowDatas);
  }, []);

  const onSaveForm = () => {
    const save_data = [...rowData];
    for (const row of save_data) {
      if (!row.title || !row.column || !row.sella_title || !row.sella_code) return; // TODO error
    }
    request.post(`user/forms/save`, { aidx, name: formNameRef.current.value, save_data }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        Recoils.setState('DATA:PLATFORMS', ret.data);
        navigate('/settlement/form_management');
      }
    });
  };
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

          excelDataRef.current = items;
        };

        if (rABS) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    });
  };

  const onClick = (e) => {
    e.preventDefault();
    if (!excelDataRef.current) {
      alert('주문 양식을 업로드해주세요.');
      return;
    }

    let rowIndex = e.currentTarget.parentNode.parentNode.rowIndex;
    if (typeof rowIndex != 'undefined' || rowIndex != null) nowSelectRef.current = rowIndex;
    else {
      //td 인경우
      rowIndex = e.currentTarget.parentNode.rowIndex;

      //tr인경우
      if (typeof rowIndex == 'undefined' || rowIndex == null) rowIndex = e.currentTarget.rowIndex;
    }

    nowSelectRef.current = rowIndex;
    const excelDatas = [...excelDataRef.current];
    setExcelData(excelDatas);
  };

  const MatchCallback = ({ title, column, value }) => {
    const rowDatas = [...rowData];
    const row = rowDatas[nowSelectRef.current];
    row.title = title;
    row.column = column;
    row.value = value;
    setRowData(rowDatas);
  };

  const AddItemCallback = ({ title, code }) => {
    const rowDatas = [...rowData];
    const row_data = {};
    row_data.sella_title = title;
    row_data.sella_code = code;
    row_data.sella_essential = false;
    rowDatas.push(row_data);
    setRowData(rowDatas);

    setModalState(false);
  };

  return (
    <>
      <div>
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
            {rowData && rowData.map((d, key) => <SellaForm key={d.idx} index={key} d={d} onClick={onClick} />)}
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
            {excelData &&
              excelData.map((d, key) => <UploadExcelItems key={key} index={key} d={d} callback={MatchCallback} />)}
            <></>
          </tbody>
        </table>
      </div>
      <SellaBasicModal
        modalState={modalState}
        setModalState={setModalState}
        sella_forms={sella_forms}
        AddItemCallback={AddItemCallback}
      ></SellaBasicModal>
    </>
  );
};

const SellaForm = React.memo(({ index, d, onClick }) => {
  logger.render('SellaForm TableItem : ', index);
  return (
    <tr>
      <td>
        {d.sella_title} {d.sella_essential ? '*' : ''}
      </td>
      {d.title ? (
        <td onClick={onClick}>
          {d.title}
          {' ('}
          {d.column}
          {'열)'}
          <br />
          {d.value}
        </td>
      ) : (
        <td>
          <Button onClick={onClick}>클릭하여 매칭해주세요.</Button>
        </td>
      )}
    </tr>
  );
});

const UploadExcelItems = React.memo(({ index, d, callback }) => {
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
        <Button
          disabled={d.disabled}
          onClick={() => {
            callback({ title: d.header, column: d.column, value: d.value });
          }}
        >
          선택
        </Button>
      </td>
    </tr>
  );
});

const SellaBasicModal = React.memo(({ modalState, setModalState, sella_forms, AddItemCallback }) => {
  logger.render('SellaBasicModal');
  const unessential_forms = _.filter(sella_forms, { essential_flag: 0 });

  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered>
      <Modal.Body>
        {unessential_forms &&
          unessential_forms.map((d, key) => (
            <Button
              key={key}
              index={key}
              onClick={() => {
                AddItemCallback(d);
              }}
            >
              {d.title}
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(FormManagement_Custom_Add);
