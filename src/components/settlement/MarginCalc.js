import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import MarginCalc_UnConnectModal from 'components/settlement/MarginCalc_UnConnectModal';
import Recoils from 'recoils';
import * as xlsx from 'xlsx';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const platforms = Recoils.useValue('DATA:PLATFORMS');
  const aidx = account.aidx;
  const [viewResult, setViewResult] = useState(false);
  const [viewState, setView] = useState(true);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [modalState, setModalState] = useState(false);

  //ag-grid

  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 80,
      autoHeight: true,
    };
  }, []);
  const [columnDefs] = useState([
    { field: '', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', checkboxSelection: true, width: 5 },
    {
      field: 'profit_loss',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '손익',
      filter: false,
      unSortIcon: true,
      width: 140,
    },
    {
      field: 'payment_date',
      sortable: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'lock-pinned',
      editable: false,
      headerName: '결제일',
      filter: false,
      unSortIcon: true,
      width: 120,
    },

    { field: 'order_no', sortable: true, unSortIcon: true, headerName: '주문번호', minWidth: 160 },
    {
      field: 'forms_name',
      sortable: true,
      unSortIcon: true,
      headerName: '매체',
      minWidth: 120,
    },
    {
      field: 'forms_product_name',
      sortable: true,
      unSortIcon: true,
      headerName: '판매상품명',
      minWidth: 400,
      wrapText: true,
      vertical: 'Center',
    },
    {
      field: 'forms_option_name1',
      sortable: true,
      unSortIcon: true,
      headerName: '옵션',
      minWidth: 300,
      wrapText: true,
      vertical: 'Center',
    },
    {
      field: 'count',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '수량',
      minWidth: 100,
    },
    {
      field: 'sum_payment_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '총 결제금액(정산예정금액)',
      minWidth: 140,
    },
    {
      field: 'recieved_delivery_fee',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '받은 배송비',
      minWidth: 140,
    },
    {
      field: 'stock_price',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '입고단가',
      minWidth: 120,
    },
    {
      field: 'delivery_fee',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '배송비',
      minWidth: 100,
    },
    {
      field: 'packing_fee',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      headerName: '포장비',
      minWidth: 100,
    },
    {
      field: 'recieved_name',
      sortable: true,
      unSortIcon: true,
      headerName: '수취인명',
      minWidth: 120,
    },
    {
      field: 'recieved_addr',
      sortable: true,
      unSortIcon: true,
      headerName: '수취인 주소',
      minWidth: 140,
    },
    {
      field: 'recieved_phone',
      sortable: true,
      unSortIcon: true,
      headerName: '수취인 연락처',
      minWidth: 140,
    },
  ]);

  useEffect(() => {}, []);

  const onUpload = function () {
    setRowData([]);
    setViewResult(false);

    modal.file_upload(null, '.xlsx', '파일 업로드', { aidx, platform: platforms[platformType] }, (ret) => {
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

          const title_array = platforms[platformType].title_array;
          const title_row = platforms[platformType].title_row;

          const expected = {};

          const titles = title_array.split(', ');
          for (const ts of titles) {
            const title_splits = ts.split('(');
            const header = title_splits[0];

            const match_data = title_splits[1].split(')')[0];
            const column = match_data.split(':')[0];
            expected[column] = header;
          }

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          // for (const key in ws) {
          //   const prevlast = key[key.length - 2];
          //   const last = key[key.length - 1];

          //   if (isNaN(prevlast) && !isNaN(last) && Number(last) === title_row) {
          //     const column = key.slice(0, key.length - 1);
          //     const header = ws[key]['h'];

          //     if (expected[column] !== header) return; // 에러
          //   }
          // }

          const frm = new FormData();
          frm.append('files', file);
          frm.append('aidx', aidx);
          frm.append('platform', JSON.stringify(platforms[platformType]));

          request
            .post_form('settlement/profit_loss', frm, () => {})
            .then((ret) => {
              if (!ret.err) {
                setRowData(() => ret.data);
              }
            });
        };

        if (rABS) {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    });
  };

  const onChange = (key, e) => {
    setplatformType(key);
  };

  const onClick = () => {
    setModalState(true);
  };

  const onViewResult = () => {
    if (!rowData || !rowData.length) return;

    setViewResult(true);
  };

  const deleteCallback = (d) => {
    setRowData(
      _.filter(rowData, (item) => {
        return item.order_no != d.order_no;
      })
    );
  };

  const getRowStyle = (params) => {
    if (!params.node.data.connect_flag) {
      return { background: 'red' };
    }
  };

  return (
    <>
      <Head />
      <Body title={`손익 계산`} myClass={'margin_calc'}>
        <SettlementNavTab active="/settlement/margin_calc" />

        {viewState ? (
          <div className="page">
            <div className="btnbox">
              <DropdownButton variant="" title={platforms.length ? platforms[platformType].name : ''}>
                {platforms &&
                  platforms.map((item, key) => (
                    <Dropdown.Item
                      key={key}
                      eventKey={key}
                      onClick={(e) => onChange(key, e)}
                      active={platformType === key}
                    >
                      {item.name}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>
              <Button variant="primary" onClick={onUpload} className="btn_green">
                <img src={icon_circle_arrow_up} />새 주문서 업로드
              </Button>

              <Button variant="primary" onClick={onUpload} className="btn_red">
                선택 삭제
              </Button>

              <Button variant="primary" onClick={onViewResult} className="btn_blue">
                손익 계산
              </Button>

              {/* TODO 색 고민 해봐야.. */}
              <Button onClick={onUpload} disabled={viewResult ? false : true}>
                주문서 저장
              </Button>

              <Button variant="primary" onClick={onUpload} className="btn_green">
                <img src={icon_circle_arrow_down} />
                다운로드
              </Button>

              <Button className="btn_set">
                <img src={icon_set} />
              </Button>
            </div>

            <ul className={viewResult ? 'viewbox' : 'viewbox off'}>
              <li>
                <p className="dt">총 주문</p>
                <p className="dd">
                  999,999
                  <span>건</span>
                </p>
              </li>
              <li>
                <p className="dt">택배 발송</p>
                <p className="dd">
                  999,999
                  <span>건</span>
                </p>
              </li>
              <li>
                <p className="dt">적자 주문</p>
                <span className="dd txt_red">
                  9<span className="unit txt_red">건</span>
                </span>
              </li>
              <li>
                <p className="dt">상품 결제 금액</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
              <li>
                <p className="dt">받은 배송비</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
              {/* 손익합계 <li> className에 이익일때 profit, 손해일때 loss 넣어주세요. */}
              {/* 이 작업도 손익 계산이 다끝나면 하게 될 것 같아요! */}
              <li className="loss">
                <p className="dt">손익 합계</p>
                <p className="dd">
                  999,999
                  <span>원</span>
                </p>
              </li>
            </ul>
            {/* 표가 미어있일 경우에 'NO Rows To Show' 라고 쓰여있는데 다른 텍스트를 넣을 수 있을까요? */}
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
                  onRowDoubleClicked={onClick}
                  getRowStyle={getRowStyle}
                ></AgGridReact>
              </div>
            </div>
          </div>
        ) : (
          <Modal show={!viewState} centered className="Confirm">
            {<Modal.Title className="text-primary">{'초기 값을 설정해 주세요.'}</Modal.Title>}
            손익을 계산하시려면 기초정보, 상품정보를 등록 해주세요.
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step1');
              }}
            >
              기초정보 관리로 이동
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/step2');
              }}
            >
              상품 관리로 이동
            </Button>
          </Modal>
        )}
      </Body>
      <Footer />
      <MarginCalc_UnConnectModal
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        unconnect_flag={true}
        deleteCallback={deleteCallback}
      ></MarginCalc_UnConnectModal>
    </>
  );
};

const MarginCalcItems = React.memo(({ index, d, platform_name, onClick }) => {
  logger.render('MarginCalc TableItem : ', index);
  return (
    <tr onClick={onClick} className={d.connect_flag ? 'connected' : 'unconnected'}>
      <td className="center">
        <input type={'checkbox'}></input>
      </td>
      <td>?</td>
      <td>{d.payment_date}</td>
      <td>{d.order_no}</td>
      <td>{platform_name}</td>
      <td>{d.forms_product_name}</td>
      <td>{d.forms_option_name1}</td>
      <td>{d.count}</td>
      <td>{d.sum_payment_price}</td>
      <td>?</td>
      <td>?</td>
      <td>?</td>
      <td>?</td>
      <td>?</td>
      <td>?</td>
      <td>?</td>
    </tr>
  );
});

export default React.memo(MarginCalc);
