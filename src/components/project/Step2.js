import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Step2Modal from 'components/project/Step2Modal';
import request from 'util/request';
import { img_src, logger, modal, navigate, page_reload, replace_1000, revert_1000, time_format } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Step2.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';
import Step2_DFCellRenderer from 'components//common/AgGrid//Step2_DFCellRenderer';
import Step2_PFCellRenderer from 'components/common/AgGrid/Step2_PFCellRenderer';

let rawData;
const excel_str = [
  '신규 등록용',
  '상품정보 수정용(전체)',
  '상품정보 수정용(카테고리,상품명)',
  '상품정보 수정용(입고단가,택배비,포장비)',
];
let df_category = [];
let pf_category = [];

const Step2 = () => {
  logger.render('Step2');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const [excelType, setExcelType] = useState(0);

  const [rowData, setDatas] = useState();
  const [modalState, setModalState] = useState(false);
  const access_token = account.access_token;
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
    if (!df_category.length) {
      const deliveryData = _.cloneDeep(Recoils.getState('DATA:DELIVERY'));
      if (!deliveryData || deliveryData.length == 1) {
        // GO Step1
        modal.confirm(
          '초기 값을 설정해 주세요.',
          [{ strong: '', normal: '상품정보를 등록하시려면 \n기초정보를 등록해 주세요.' }],
          [
            {
              name: '기초 정보 관리로 이동',
              className: 'red',
              callback: () => {
                navigate('project/Step1');
              },
            },
          ]
        );
      }

      if (deliveryData.length > 1) {
        df_category = deliveryData;
        df_category.push({ delivery_category: '기타', delivery_fee: 0 });
      }
    }

    if (!pf_category.length) {
      const packingData = _.cloneDeep(Recoils.getState('DATA:PACKING'));

      if (!packingData || packingData.length == 1) {
        // GO Step1
        modal.confirm(
          '초기 값을 설정해 주세요.',
          [{ strong: '', normal: '상품정보를 등록하시려면 기초정보를 등록해 주세요.' }],
          [
            {
              name: '기초 정보 관리로 이동',
              callback: () => {
                navigate('step1');
              },
            },
          ]
        );
      }

      if (packingData.length > 1) {
        pf_category = packingData;
        pf_category.push({ packing_category: '기타', packing_fee: 0 });
      }
    }
  }, []);

  useEffect(() => {
    const goodsData = _.cloneDeep(Recoils.getState('DATA:GOODS'));
    rawData = _.cloneDeep(goodsData);
    setDatas(goodsData);
  }, []);

  const onCellValueChanged = (params, callback) => {
    let column = params.column.colDef.field;
    if (column == 'delivery_fee') {
      if (
        rawData &&
        rawData[params.node.rowIndex]['delivery_fee'] &&
        rawData[params.node.rowIndex]['delivery_fee'] !== Number(params.data.delivery_fee)
      ) {
        params.column.colDef.cellClass = 'td_input txt_red';
        params.api.refreshCells({
          force: true,
          columns: [column],
          rowNodes: [params.node],
        });
      } else {
        let column = params.column.colDef.field;
        params.column.colDef.cellClass = 'td_input txt_black';
        params.api.refreshCells({
          force: true,
          columns: [column],
          rowNodes: [params.node],
        });
      }

      return;
    }

    if (column == 'packing_fee') {
      if (
        rawData &&
        rawData[params.node.rowIndex]['packing_fee'] &&
        rawData[params.node.rowIndex]['packing_fee'] !== Number(params.data.packing_fee)
      ) {
        params.column.colDef.cellClass = 'td_input txt_red';
        // callback('red');
        params.api.refreshCells({
          force: true,
          columns: [column],
          rowNodes: [params.node],
        });
      } else {
        let column = params.column.colDef.field;
        params.column.colDef.cellClass = 'td_input txt_black';
        params.api.refreshCells({
          force: true,
          columns: [column],
          rowNodes: [params.node],
        });
      }

      return;
    }

    if (rawData && rawData[params.node.rowIndex][column] && rawData[params.node.rowIndex][column] !== params.newValue) {
      params.column.colDef.cellClass = 'txt_red';
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    } else {
      let column = params.column.colDef.field;
      params.column.colDef.cellClass = 'txt_black';
      params.api.refreshCells({
        force: true,
        columns: [column],
        rowNodes: [params.node],
      });
    }
  };

  const [columnDefs] = useState([
    {
      editable: false,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      cellClass: 'lock-pinned checkcell',
      pinned: 'left',
      lockPinned: true,
      maxWidth: 36,
    },
    {
      field: 'idx',
      headerName: '* 상품코드',
      sortable: true,
      editable: false,
      filter: false,
      pinned: 'left',
      lockPinned: true,
      width: 120,
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
      cellClass: 'codecell uneditable',
    },
    {
      field: 'goods_category',
      headerName: '* 카테고리',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'lock-pinned',
      pinned: 'left',
      lockPinned: true,
      width: 120,
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'name',
      headerName: '* 상품명',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'lock-pinned prd_name',
      pinned: 'left',
      lockPinned: true,
      width: 250,
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'stock_price',
      headerName: '* 입고가',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => {
        return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
      },
      valueFormatter: (params) => {
        if (params.value == '') return 0;
        return replace_1000(params.value);
      },
      filter: false,
      cellDataType: 'number', // 인풋 타입을 넘버로 바꾸고싶어요ㅠㅠ
      cellClass: 'ag-cell-editable',
      maxWidth: 90,
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'delivery_fee',
      headerName: '* 택배비',
      sortable: true,
      unSortIcon: true,
      filter: false,
      // cellDataType: 'number', // 인풋 타입을 넘버로 바꾸고싶어요ㅠㅠ , project 폴더에 Step2_PopupCellRenderer 쪽에서 input있는데 컨트롤 하시면됩니다^^
      editable: false,
      cellClass: 'td_input',
      cellRenderer: Step2_DFCellRenderer,
      cellRendererParams: {
        df_category,
        rawData,
        onCellValueChanged,
      },
      minWidth: 215,
    },
    {
      field: 'packing_fee',
      headerName: '* 포장비',
      sortable: true,
      unSortIcon: true,
      filter: false,
      editable: false,
      cellClass: 'td_input',
      cellRenderer: Step2_PFCellRenderer,
      cellRendererParams: {
        pf_category,
        rawData,
        onCellValueChanged,
      },
      minWidth: 215,
    },
    {
      field: 'box_amount',
      headerName: '박스입수량',
      sortable: true,
      unSortIcon: true,
      valueParser: (params) => Number(params.newValue),
      filter: false,
      cellClass: 'ag-cell-editable',
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'single_delivery',
      headerName: '단독배송',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellEditor: 'agSelectCellEditor',
      cellClass: 'ag-cell-editable',
      cellEditorParams: {
        values: ['Y', 'N'],
      },
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'barcode',
      headerName: '바코드',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable',
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'rrp',
      headerName: '권장소비자가',
      sortable: true,
      unSortIcon: true,
      filter: false,
      cellClass: 'ag-cell-editable',
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
      valueParser: (params) => {
        return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
      },
      valueFormatter: (params) => {
        if (params.value == '') return 0;
        return replace_1000(params.value);
      },
    },
    {
      field: 'memo',
      headerName: '메모',
      filter: false,
      cellClass: 'ag-cell-editable',
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'reg_date',
      headerName: '최초 등록일',
      sortable: true,
      unSortIcon: true,
      filter: false,
      editable: false,
      cellClass: 'uneditable',
      valueFormatter: (params) => {
        if (params.value == '') return '';
        return time_format(params.value);
      },
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
    {
      field: 'modify_date',
      headerName: '최종 수정일',
      sortable: true,
      unSortIcon: true,
      filter: false,
      editable: false,
      cellClass: 'uneditable',
      valueFormatter: (params) => {
        if (params.value == '') return '';
        return time_format(params.value);
      },
      cellStyle: { 'line-height': '30px', 'text-align': 'right' },
    },
  ]);

  const onDelete = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedIdxs = _.map(selectedRows, 'idx');
      modal.confirm(
        '데이터를 삭제하시겠습니까?',
        [{ strong: '', normal: '' }],
        [
          {
            name: '예',
            callback: () => {
              request.post(`user/goods/delete`, { idxs: selectedIdxs }).then((ret) => {
                if (!ret.err) {
                  const { data } = ret.data;
                  logger.info(data);

                  Recoils.setState('DATA:GOODS', data);

                  page_reload();
                }
              });
            },
          },

          {
            name: '아니오',
            callback: () => {},
          },
        ]
      );
    }
  };

  const rowHeight = 46;

  const onModify = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedCopyRows = _.cloneDeep(selectedRows);
      for (const row of selectedCopyRows) {
        row.delivery_fee = revert_1000(row.delivery_fee);
        row.packing_fee = revert_1000(row.packing_fee);
      }

      request.post(`user/goods/modify`, { selectedRows: selectedCopyRows }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          Recoils.setState('DATA:GOODS', data);
          page_reload();
        }
      });
    }
  };

  const onInsert = (e) => {
    setModalState(true);
  };

  const onUpload = function () {
    modal.file_upload(null, '.xlsx', '상품정보 엑셀 파일을 선택해주세요.', {}, (ret) => {
      if (!ret.err) {
        const { files } = ret;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
          const bstr = e.target.result;
          const wb = xlsx.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });

          const frm = new FormData();
          frm.append('files', file);
          frm.append('Authorization', access_token);

          request
            .post_form('user/goods/save', frm, () => {})
            .then((ret) => {
              if (!ret.err) {
                const { data } = ret.data;
                logger.info(data);
                Recoils.setState('DATA:GOODS', data);

                rawData = _.cloneDeep(data);
                setDatas(_.cloneDeep(data));
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

  const onDownload = async (type, e) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('상품입고용');

    worksheet.columns = [
      { header: '상품번호', key: 'idx', width: 18 },
      { header: '카테고리', key: 'goods_category', width: 18 },
      { header: '상품명', key: 'name', width: 25 },
      { header: '입고단가', key: 'stock_price', width: 10 },
      { header: '택배비', key: 'delivery_fee', width: 10 },
      { header: '포장비', key: 'packing_fee', width: 10 },
      { header: '박스입수량', key: 'box_amount', width: 10 },
      { header: '단독배송', key: 'single_delivery', width: 10 },
      { header: '바코드', key: 'barcode', width: 10 },
      { header: '권장소비자가', key: 'rrp', width: 10 },
      { header: '메모', key: 'memo', width: 30 },
    ];

    switch (type) {
      case 0:
      case 1:
        break;
      case 2:
        worksheet.columns = _.transform(
          worksheet.columns,
          function (result, item) {
            if (item.key == 'idx') {
              item.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
              };
            }

            if (item.key != 'idx' && item.key != 'goods_category' && item.key != 'name') {
              item.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
              };
            }

            result.push(item);
          },
          []
        );
        break;
      case 3:
        worksheet.columns = _.transform(
          worksheet.columns,
          function (result, item) {
            if (
              item.key != 'stock_price' &&
              item.key != 'delivery_descript' &&
              item.key != 'delivery_fee' &&
              item.key != 'packing_descript' &&
              item.key != 'packing_fee'
            ) {
              item.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
              };
            }

            result.push(item);
          },
          []
        );
        break;
      default:
        break;
    }

    switch (type) {
      case 0:
        break;
      default:
        let columnData = _.cloneDeep(rowData);
        _.map(columnData, (obj) => {
          _.unset(obj, 'reg_date');
          _.unset(obj, 'modify_date');
        });

        worksheet.addRows(columnData);
        break;
    }

    worksheet.getColumn('idx').numFmt = '0';

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    saveAs(blob, '상품저장기본양식.xlsx');
  };

  const onChange = (key, e) => {
    setExcelType(key);
  };

  return (
    <>
      <Head />
      <Body title={`Step2`} myClass={'step2'}>
        <div className="page">
          <div className="btnbox_left">
            <Button variant="primary" onClick={onDelete} className="btn_red">
              선택 삭제
            </Button>{' '}
            <Button variant="primary" onClick={onModify} className="btn_blue">
              선택 저장
            </Button>{' '}
            <Button variant="primary" onClick={onInsert}>
              상품 추가
            </Button>{' '}
            <p class="prdcount">
              전체 상품 <span>{rowData && rowData.length}</span> 개
            </p>
          </div>
          <div className="btnbox_right">
            <Button variant="primary" onClick={onUpload} className="btn_green">
              <img src={`${img_src}${icon_circle_arrow_down}`} />
              상품 엑셀 업로드
            </Button>{' '}
            <DropdownButton variant="" title={excel_str[excelType]}>
              {excel_str.map((name, key) => (
                <Dropdown.Item key={key} eventKey={key} onClick={(e) => onChange(key, e)} active={excelType === key}>
                  {excel_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Button
              variant="primary"
              onClick={(e) => {
                onDownload(excelType, e);
              }}
              className="btn_green"
            >
              <img src={`${img_src}${icon_circle_arrow_down}`} />
              상품 엑셀 다운로드
            </Button>
            {/* <Button className="btn_set">
              <img src={`${img_src}${icon_set}`} />
            </Button> */}
          </div>
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
                onCellEditingStopped={onCellValueChanged}
                singleClickEdit={true}
                rowHeight={rowHeight}
              ></AgGridReact>
            </div>
          </div>
        </div>
      </Body>
      <Footer />

      <Step2Modal modalState={modalState} setModalState={setModalState}></Step2Modal>
    </>
  );
};

export default React.memo(Step2);
