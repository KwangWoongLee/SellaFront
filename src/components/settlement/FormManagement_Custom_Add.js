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
  const searchRef = useRef(null);
  const [modalState, setModalState] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const excelDataRef = useRef(null);
  const nowSelectRef = useRef(null);
  const [selectRow, setSelectRow] = useState(0);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    formNameRef.current.value = platform.name;
    const rowDatas = [];

    const essential_forms = _.filter(sella_forms, { essential_flag: 1 });
    for (const sella_form of essential_forms) {
      const row_data = {};
      if (sella_form.check_flag) {
        row_data.check_flag = sella_form.check_flag;
        row_data.checked = true;
      }
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
    if (save_data.length == 0) {
      modal.alert('저장할 항목이 없습니다.');
      return;
    }

    for (const row of save_data) {
      if (row.check_flag && !row.checked) continue;
      else {
        if (!row.title || !row.column || !row.sella_title || !row.sella_code) {
          modal.alert('매칭되지 않은 항목이 있습니다.');
          return; // TODO error
        }

        if (row.sella_code == 30032) {
          if (!row.mf_fee_rate) {
            modal.alert('조립비는 조립비 수수료 항목을 입력하세요.');
            return;
          }

          row.additional = row.mf_fee_rate;
        }

        if (row.sella_code == 30033) {
          if (!row.if_fee_rate) {
            modal.alert('설치비는 설치비 수수료 항목을 입력하세요.');
            return;
          }

          row.additional = row.if_fee_rate;
        }

        if (row.sella_code == 30047) {
          if (!row.df_fee_rate) {
            modal.alert('배송비는 배송비 수수료 항목을 입력하세요.');
            return;
          }

          row.additional = row.df_fee_rate;
        }
      }
    }
    request.post(`user/forms/save`, { aidx, forms_name: formNameRef.current.value, save_data }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        Recoils.setState('DATA:PLATFORMS', data);
        navigate('/settlement/form_management');
      }
    });
  };
  const onAddSellaBasic = () => {
    setModalState(true);
  };

  const onUpload = function () {
    const rowDatas = [];

    const essential_forms = _.filter(sella_forms, { essential_flag: 1 });
    for (const sella_form of essential_forms) {
      const row_data = {};
      if (sella_form.check_flag) {
        row_data.check_flag = sella_form.check_flag;
        row_data.checked = true;
      }
      if (sella_form.tooltip) row_data.tooltip = sella_form.tooltip;

      row_data.sella_title = sella_form.title;
      row_data.sella_essential = sella_form.essential_flag;
      row_data.sella_code = sella_form.code;
      rowDatas.push(row_data);
    }

    setRowData(rowDatas);

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

          const excelDatas = [...excelDataRef.current];
          setExcelData(excelDatas);
          setMode(1);
        };

        if (rABS) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    });
  };

  const onNewUpload = function () {
    excelDataRef.current = null;
    nowSelectRef.current = null;
    setExcelData([]);
    setMode(0);

    const rowDatas = [];

    const essential_forms = _.filter(sella_forms, { essential_flag: 1 });
    for (const sella_form of essential_forms) {
      const row_data = {};
      if (sella_form.check_flag) {
        row_data.check_flag = sella_form.check_flag;
        row_data.checked = true;
      }
      if (sella_form.tooltip) row_data.tooltip = sella_form.tooltip;

      row_data.sella_title = sella_form.title;
      row_data.sella_essential = sella_form.essential_flag;
      row_data.sella_code = sella_form.code;
      rowDatas.push(row_data);
    }

    setRowData(rowDatas);

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

          const excelDatas = [...excelDataRef.current];
          setExcelData(excelDatas);
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

    setMode(2);
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
    const rowDatas = [...rowData];
    const obj = _.find(rowData, { sella_code: d.sella_code });
    obj.checked = !d.checked;
    setRowData(rowDatas);
  };

  const onSearch = (e) => {
    e.preventDefault();

    const search = searchRef.current.value;

    const search_results = _.filter(excelDataRef.current, (row) => {
      return _.includes(row.header, search);
    });

    setExcelData(search_results);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <>
      {/* 주문양식을 불러오기 전 해당 영역은 비어있고 엑셀 업로드 버튼 한개만 떠있게 됩니다. 피그마에 나와있어요!
    >>> '클릭하여 매칭해주세요' 를 클릭하면 옆에 데이터창이 스르륵 나왔다가 스르륵 사라집니다. 
    애니메이션 효과는 벤치마킹한 사이트를 보면서 설명드릴게요, 작업하실때 말씀주세요!  */}
      <div className="leftbox">
        <h3>매체명</h3>
        <div className="inputbox">
          <input type={'text'} ref={formNameRef}></input>
          <button onClick={onSaveForm} className="btn-primary btn btn_blue">
            양식 저장
          </button>
        </div>

        <Button variant="primary" className="btn_add" onClick={onAddSellaBasic}>
          항목 추가
        </Button>
        <table className="thead">
          <thead>
            <th>셀라 표준 항목</th>
            <th>선택한 엑셀 항목</th>
            <th>비고</th>
          </thead>
        </table>
        <table className="tbody">
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
        {mode == 0 && (
          <span>
            <Button onClick={onUpload}>여기를 클릭</Button> 하여 주문양식을 업로드 해주세요.
          </span>
        )}
        {mode == 1 && (
          <>
            <span>주문항목을 매칭하시려면 왼쪽 표에서 매칭할 항목을 선택해 주세요.</span>
          </>
        )}

        {mode == 2 && (
          <>
            <Button variant="primary" onClick={onNewUpload} className="btn_green">
              주문 양식 불러오기
            </Button>
            {/* 주문양식 불러온 후 > 불러온 데이터를 뿌려주면 좋을 것 같습니다. */}
            <div className="inputbox">
              <input
                type="text"
                className="input_search"
                placeholder="항목명"
                ref={searchRef}
                onKeyDown={handleKeyDown}
              ></input>
              <Button className="btn_search" onClick={onSearch}>
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
          </>
        )}
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
  // 클릭 전에 항상 첫번째 tr에 포커스가 들어와 있으면 좋을것 같습니다.
  // >>> 요거 다른 항목을 클릭해도 포커스가 유지되네용 ? ㅎㅎ 첫번째 행 focus는 처음 새로고침했을때만 들어와있으면 좋을것 같습니다 ㅎㅎ
  // 이거 잘 안돼서.. 조금만 후에 하도록할게요!

  const dfFeeRateRef = useRef(null);
  const mfFeeRateRef = useRef(null);
  const ifFeeRateRef = useRef(null);

  const onChangeInput = (type, ref) => {
    if (ref.current) {
      switch (type) {
        case 'df':
          d.df_fee_rate = ref.current.value;
          break;
        case 'mf':
          d.mf_fee_rate = ref.current.value;
          break;
        case 'if':
          d.if_fee_rate = ref.current.value;
          break;
      }
    }
  };

  return (
    <tr className={selectRow == index ? 'focus' : ''}>
      <td className={d.sella_essential ? 'td_label required' : 'td_label'}>
        {d.check_flag && (
          <>
            <Checkbox
              checked={d.checked}
              checkedItemHandler={() => {
                checkedItemHandler(d);
              }}
            ></Checkbox>
          </>
        )}
        <label>
          {d.sella_title} {d.sella_essential ? '*' : ''}
        </label>
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
              <Button className="btn_tip"></Button>
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
          <Button disabled={d.check_flag && !d.checked ? true : false} onClick={onClick}>
            여기를 클릭하여 매칭해주세요.
          </Button>
        </td>
      )}
      {d.sella_code == 30047 && (
        <td>
          배송비 수수료{' '}
          {
            <input
              ref={dfFeeRateRef}
              onChange={() => {
                onChangeInput('df', dfFeeRateRef);
              }}
            ></input>
          }
          %{' '}
        </td>
      )}
      {d.sella_code == 30032 && (
        <td>
          조립비 수수료{' '}
          {
            <input
              ref={mfFeeRateRef}
              onChange={() => {
                onChangeInput('mf', mfFeeRateRef);
              }}
            ></input>
          }
          %
        </td>
      )}
      {d.sella_code == 30033 && (
        <td>
          설치비 수수료{' '}
          {
            <input
              ref={ifFeeRateRef}
              onChange={() => {
                onChangeInput('if', ifFeeRateRef);
              }}
            ></input>
          }
          %
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
        <p>{d.value}</p>
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
