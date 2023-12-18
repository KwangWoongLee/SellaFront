import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Table, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Checkbox from 'components/common/CheckBoxCell';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Step2Modal from 'components/project/Step2Modal';
import request from 'util/request';
import {
  time_format_none_time,
  img_src,
  logger,
  modal,
  navigate,
  page_reload,
  replace_1000,
  revert_1000,
  time_format,
} from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useMediaQuery } from 'react-responsive';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Step2.scss';
import MobileRefuser from 'components/template/MobileRefuser';

let rawData;
const excel_str = [
  '엑셀 일괄 작업',
  '엑셀 내려받기 (신규 등록용)',
  '엑셀 내려받기 (상품 수정용)',
  '엑셀 올리기 (신규 등록용)',
  '엑셀 올리기 (상품 수정용)',
];

const Step2 = () => {
  //logger.debug('Step2');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const [excelType, setExcelType] = useState(0);

  const [rowData, setDatas] = useState();
  const [modalState, setModalState] = useState(false);
  const access_token = account.access_token;
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const isMobile = useMediaQuery({
    query: '(max-width:1024px)',
  });

  useEffect(() => {
    const goodsData = _.cloneDeep(Recoils.getState('DATA:GOODS'));
    rawData = _.cloneDeep(goodsData);
    setDatas(goodsData);
  }, []);

  const onCellValueChanged = (params, callback) => {
    let column = params.column.colDef.field;
    if (rawData && rawData[params.node.rowIndex][column] !== params.newValue) {
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

  const onDelete = (e) => {
    const selectedRows = _.filter(rowData, { checked: true });
    if (selectedRows && selectedRows.length > 0) {
      const selectedIdxs = _.map(selectedRows, 'idx');
      modal.confirm(
        '',
        [{ strong: '', normal: '데이터를 삭제하시겠습니까?' }],
        [
          {
            name: '예',
            callback: () => {
              request.post(`user/goods/delete`, { idxs: selectedIdxs }).then((ret) => {
                if (!ret.err) {
                  const { data } = ret.data;
                  logger.info(data);

                  Recoils.setState('DATA:GOODS', data.goods);
                  Recoils.setState('DATA:FORMSMATCH', data.forms_match);
                  Recoils.setState('DATA:GOODSMATCH', data.goods_match);

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

  // 체크박스 선택
  const handleSingleCheck = (idx, checked) => {
    const findObj = _.find(rowData, { idx: idx });
    findObj.checked = checked;

    setDatas([...rowData]);
  };

  // 체크박스 전체 선택
  const handleAllCheck = (checked) => {
    for (const row of rowData) {
      row.checked = checked;
    }

    setDatas([...rowData]);
  };

  const onModify = (e) => {
    const selectedRows = _.filter(rowData, { checked: true });
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

  const onUpload = function (type) {
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
          frm.append('type', type);

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
    let filename = '셀라_신규등록용';
    const now = new Date();
    const timeStr = time_format_none_time(now);

    worksheet.columns = [
      { header: '상품명', key: 'name', width: 25 },
      { header: '입고단가', key: 'stock_price', width: 10 },
      { header: '택배비', key: 'delivery_fee', width: 10 },
      { header: '포장비', key: 'packing_fee', width: 10 },
      { header: '카테고리', key: 'goods_category', width: 18 },
      { header: '메모', key: 'memo', width: 30 },
    ];

    ['A1', 'B1', 'C1'].map((key) => {
      worksheet.getCell(key).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ffdcdc' },
      };
    });

    switch (type) {
      case 2:
        filename = '셀라_상품수정용';
        worksheet.columns = [{ header: '상품번호', key: 'idx', width: 18 }, ...worksheet.columns];
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

            ['B1', 'C1', 'D1'].map((key) => {
              worksheet.getCell(key).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'ffdcdc' },
              };
            });

            result.push(item);
          },
          []
        );
        break;
      default:
        break;
    }

    let columnData = _.cloneDeep(rowData);
    _.map(columnData, (obj) => {
      switch (type) {
        case 1:
          _.unset(obj, 'idx');
          break;
        default:
          break;
      }

      _.unset(obj, 'reg_date');
      _.unset(obj, 'modify_date');
    });

    if (type !== 1) {
      worksheet.getColumn('idx').numFmt = '0';
    }

    if (type == 2) worksheet.addRows(columnData);

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    saveAs(blob, `${filename}_${timeStr}.xlsx`);
  };

  const onChangeExcelType = (key, e) => {
    switch (key) {
      case 1:
      case 2:
        onDownload(key);
        break;
      case 3:
      case 4:
        onUpload(key, e);
        break;
    }

    setExcelType(key);
  };

  return (
    <>
      <Head />
      <Body title={`Step2`} myClass={'step2'}>
        <div className="page">
          {isMobile ? (
            <MobileRefuser></MobileRefuser>
          ) : (
            <>
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
                <span className="icon_Excel2">엑셀일괄작업</span>
                <DropdownButton variant="" title={excel_str[excelType]}>
                  {excel_str.map((_, key) => (
                    <Dropdown.Item
                      key={key}
                      eventKey={key}
                      onClick={(e) => onChangeExcelType(key, e)}
                      active={excelType === key}
                    >
                      {excel_str[key]}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
              <div style={containerStyle} className="tablebox">
                <Table className="thead">
                  <thead>
                    <th>
                      <Checkbox
                        checked={
                          rowData &&
                          _.filter(rowData, (row) => {
                            return row.checked;
                          }).length === rowData.length
                            ? true
                            : false
                        }
                        checkedItemHandler={handleAllCheck}
                      ></Checkbox>
                    </th>
                    <th>상품코드</th>
                    <th>상품명</th>
                    <th>입고단가</th>
                    <th>배송비</th>
                    <th>포장비</th>
                    <th>카테고리</th>
                    <th>메모</th>
                    <th>최초등록일</th>
                    <th>최종수정일</th>
                  </thead>
                  <tbody></tbody>
                </Table>
                <Table className="tbody">
                  <thead></thead>
                  <tbody>
                    {rowData &&
                      rowData.map((d, key) => (
                        <ProductRow
                          rowChecked={d.checked}
                          handleSingleCheck={handleSingleCheck}
                          key={key}
                          index={key}
                          d={d}
                        />
                      ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </div>
      </Body>
      <Footer />

      <Step2Modal
        modalState={modalState}
        setModalState={setModalState}
        callback={(insertedData, goodsData) => {
          rawData = _.cloneDeep(goodsData);
          const realInsertedData = _.filter(insertedData, (d) => d.name);
          const ordered_results = [];
          for (const data of realInsertedData) {
            const findObj = _.find(goodsData, { name: data.name });
            ordered_results.push(findObj);
          }

          const raw_results = _.filter(
            goodsData,
            (d) => !_.find(realInsertedData, (inserted) => inserted.name === d.name)
          );

          setDatas([...ordered_results, ...raw_results]);
        }}
      ></Step2Modal>
    </>
  );
};

const ProductRow = React.memo(({ handleSingleCheck, rowChecked, d }) => {
  const [inputs, setInputs] = useState({
    name: '',
    stock_price: '',
    delivery_fee: '',
    packing_fee: '',
    goods_category: '',
    memo: '',
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(rowChecked);
  }, [rowChecked]);

  useEffect(() => {
    setInputs(
      _.cloneDeep({
        ...d,
        stock_price: d.stock_price == '' ? '0' : replace_1000(d.stock_price),
        delivery_fee: d.delivery_fee == '' ? '0' : replace_1000(d.delivery_fee),
        packing_fee: d.packing_fee == '' ? '0' : replace_1000(d.packing_fee),
      })
    );
  }, []);

  const checkedItemHandler = (e) => {
    handleSingleCheck(d.idx, !checked);
    setChecked(!checked);
  };

  const onChange = (e) => {
    const { value, name } = e.target; // 우선 e.target 에서 name 과 value 를 추출

    const replace_value = replace_1000(revert_1000(value));
    setInputs({
      ...inputs, // 기존의 input 객체를 복사한 뒤
      [name]: replace_value, // name 키를 가진 값을 value 로 설정
    });

    d[name] = revert_1000(value);
  };

  const onChangeString = (e) => {
    const { value, name } = e.target; // 우선 e.target 에서 name 과 value 를 추출

    setInputs({
      ...inputs, // 기존의 input 객체를 복사한 뒤
      [name]: value, // name 키를 가진 값을 value 로 설정
    });

    d[name] = value;
  };

  return (
    <tr>
      <td>
        <Checkbox checked={checked} checkedItemHandler={checkedItemHandler}></Checkbox>
      </td>
      <td>{d.idx}</td>
      <td>
        <input name="name" value={inputs.name} onChange={onChangeString}></input>
      </td>
      <td>
        <input name="stock_price" value={inputs.stock_price} onChange={onChange} className="inputspan"></input>
        <span>원</span>
      </td>
      <td>
        <input name="delivery_fee" value={inputs.delivery_fee} onChange={onChange} className="inputspan"></input>
        <span>원</span>
      </td>
      <td>
        <input name="packing_fee" value={inputs.packing_fee} onChange={onChange} className="inputspan"></input>
        <span>원</span>
      </td>
      <td>
        <input name="goods_category" value={inputs.goods_category} onChange={onChangeString}></input>
      </td>
      <td>
        <input name="memo" value={inputs.memo} onChange={onChangeString}></input>
      </td>
      <td>{d.reg_date && time_format(d.reg_date)}</td>
      <td>{d.modify_date && time_format(d.modify_date)}</td>
    </tr>
  );
});

export default React.memo(Step2);
