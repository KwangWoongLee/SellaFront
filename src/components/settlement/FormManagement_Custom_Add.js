import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import * as xlsx from 'xlsx';
import Checkbox from 'components/common/CheckBoxCell';

import { logger } from 'util/com';
import _ from 'lodash';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/FormManagement.scss';

import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

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
  const [selectRow, setSelectRow] = useState(0);

  useEffect(() => {
    formNameRef.current.value = platform.name;
    const rowDatas = [];

    const essential_forms = _.filter(sella_forms, { essential_flag: 1 });
    for (const sella_form of essential_forms) {
      const row_data = {};
      if (sella_form.check_flag) row_data.check_flag = sella_form.check_flag;
      if (sella_form.tooltip) row_data.tooltip = sella_form.tooltip;

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
      setSelectRow(0);
      alert('주문 양식을 업로드해주세요.');
      return;
    }

    let rowIndex = e.currentTarget.parentNode.parentNode.rowIndex;

    setSelectRow(rowIndex);
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

  const checkedItemHandler = (d) => {
    console.log(d);
  };

  return (
    <>
      <div className="leftbox">
        <h3>매체명</h3>
        <div className="inputbox">
          <input type={'text'} ref={formNameRef}></input>
          <button className="btn-primary btn btn_blue">양식 저장</button>
        </div>
        <Button variant="primary" className="btn_add" onClick={onAddSellaBasic}>
          항목 추가
        </Button>
        <table className="thead">
          <thead>
            <th>셀라 표준 항목</th>
            <th>선택한 엑셀 항목</th>
          </thead>
        </table>
        <table className="tbody">
          {/* 여기 들어오는 데이터 중 별표달린 필수값은 빨간색 텍스트인데, 해당 td에 required 클래스 넣어주면 됩니다. */}
          {/* '정산예정금액이있습니다' 항목에 체크박스, 툴팁버튼 있습니다 */}
          {/* '배송비 묶음번호가 있습니다' 항목에 체크박스, 툴팁버튼 있습니다 */}
          {/* 선택한 엑셀항목 열에 선택 전 '클릭하여 매칭해주세요' 라고 떠요 ㅎㅎ 
            요것은 무슨말인지 모르겠어요ㅠ
          */}
          <tbody>
            {rowData &&
              rowData.map((d, key) => (
                <SellaForm
                  key={d.idx}
                  index={key}
                  d={d}
                  onClick={onClick}
                  selectRow={selectRow}
                  checkedItemHandler={checkedItemHandler}
                />
              ))}
            <></>
          </tbody>
        </table>
      </div>

      <div className="rightbox">
        <Button variant="primary" onClick={onUpload} className="btn_green">
          주문 양식 불러오기
        </Button>
        <div className="inputbox">
          <input type="text" className="input_search" placeholder="항목명"></input>
          <Button className="btn_search">
            <img src={icon_search} />
          </Button>
          <Button className="btn_reset">
            <img src={icon_reset} />
          </Button>
        </div>
        <table className="thead">
          <thead>
            <th>열</th>
            <th>업로드한 엑셀 항목</th>
            <th> </th>
          </thead>
        </table>
        <table className="tbody">
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

const SellaForm = React.memo(({ index, d, selectRow, onClick, checkedItemHandler }) => {
  logger.render('SellaForm TableItem : ', index);
  /* 이부분 포커스가 들어가면 tr에 백그라운드 흰색이 나오는데,    옆에서 항목을 선택하면 포커스가 아웃되어서 옆 영역을 클릭해도 포커스가 유지될 수 있도록 가능할까요? 클릭한 tr에 포커스를 유지하는게 가능하다면 className="focus" 라고 넣어주시면 제가 스타일에서 제어하겠습니다.*/
  // 클릭 전에 항상 첫번째 tr에 포커스가 들어와 있으면 좋을것 같습니다.
  // td_label 영역은 버튼이 없어서 클릭해도 포커스가 적용되지 않아 버튼을 임시로 넣어두었습니다.. 그런데, 버튼을 만들어 포커스를 넣어도 같은 행 엑셀항목의 데이터가 바뀌지 않네요..ㅎㅎ 이부분 전화로 나중에 의논드릴게요!

  // 마지막 td_label 영역을 click해서 클릭하여매칭해주세요. 부분과 같이 동작하도록 하는것은 어렵습니다.ㅠ
  // 그렇게하면, checkbox나 tooltip의 클릭과 같이 먹을듯싶네요
  return (
    <tr className={selectRow == index ? 'focus' : ''}>
      <td className={d.sella_essential ? 'td_label required' : 'td_label'}>
        {d.check_flag && (
          <>
            <Checkbox
              checked={true}
              checkedItemHandler={() => {
                checkedItemHandler(d);
              }}
            ></Checkbox>
          </>
        )}
        {d.sella_title} {d.sella_essential ? '*' : ''}
        {d.tooltip && (
          <>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tooltip">
                  <strong>{d.tooltip.title}</strong>
                  {d.tooltip.contents.map((d, key) => (
                    <>
                      <br />* {d}
                    </>
                  ))}
                </Tooltip>
              }
            >
              <Button>툴팁</Button>
            </OverlayTrigger>
          </>
        )}
      </td>
      {d.title ? (
        <td onClick={onClick} className="td_clicked">
          <Button onClick={onClick}>
            <b>
              {d.title}
              {' ('}
              {d.column}
              {'열)'}
            </b>
            <span>{d.value}</span>
          </Button>
        </td>
      ) : (
        <td className="td_click">
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
          className="btn_blue"
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
