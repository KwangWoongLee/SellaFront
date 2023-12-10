import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { img_src, modal } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { logger } from 'util/com';
import _ from 'lodash';

import 'styles/FormManagement.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';

const FormManagement_Basic = (param) => {
  //logger.debug('FormManagement_Basic');

  const { platform } = param;
  const sella_basic_forms = Recoils.getState('SELLA:BASICFORMS');
  const sella_forms = Recoils.useValue('SELLA:SELLAFORMS');

  const [formData, setFormData] = useState(null);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (!platform || !platform.basic_form_flag) return;
    const rowData = [];

    const sella_basic_form = _.find(sella_basic_forms, { name: platform.name });
    const basic_form = platform;
    const basic_form_rows = [];
    const column_row = [''];
    const header_row = [`${basic_form.title_row}`];
    const titles = sella_basic_form.titles;

    for (const sella_form of sella_forms) {
      const find_platform_data = _.find(titles, { sella_code: `${sella_form.code}` });
      if (find_platform_data) {
        const my_platform_data = _.cloneDeep(find_platform_data);
        my_platform_data.sella_title = sella_form.title;
        my_platform_data.sella_essential = sella_form.essential_flag;
        rowData.push(my_platform_data);
      }
    }

    /*
    for (const title of titles) {
      const header = title.title;
      const column = title.column;
      column_row.push(column);
      header_row.push(header);
    }
    basic_form_rows.push(column_row);
    for (let i = 1; i < basic_form.title_row; ++i) {
      const empty_row = [`${i}`];
      for (let j = 0; j < header_row.length - 1; ++j) empty_row.push('');
      basic_form_rows.push(empty_row);
    }
    basic_form_rows.push(header_row);*/

    setRowData(rowData);
  }, [param]);

  const onDownload = async () => {
    if (!platform) return;

    const sella_basic_form = _.find(sella_basic_forms, { name: platform.name });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const columns = [];

    for (const title of sella_basic_form.titles) {
      const obj = {
        header: title.title,
        key: title.sella_code,
        width: 30,
      };

      columns.push(obj);
    }
    worksheet.columns = columns;

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    saveAs(blob, `셀라 기본 양식_${platform.name}.xlsx`);
  };

  return (
    <>
      {platform && (
        <>
        < className="leftbox read">
          <h3>{platform.name} - 양식 확인</h3>
          <Button variant="primary" onClick={onDownload} className="btn_green">
            <img src={`${img_src}${icon_circle_arrow_down}`} />
            엑셀 양식 다운로드
          </Button>
          <table className="thead">
            <thead>
              <th>셀라 표준 항목</th>
              <th>선택한 엑셀 항목</th>
            </thead>
          </table>
          <table className="tbody">
            <tbody>
              {rowData && rowData.map((d, key) => <SellaForm key={key} index={key} d={d} />)}
              <></>
            </tbody>
          </table>
        </div>
        
      )}
    </>
  );
};

const SellaForm = React.memo(({ index, d }) => {
  //logger.debug('SellaForm TableItem : ', index);
  return (
    d.title &&
    d.column && (
      <tr>
        <td>
          {d.sella_title} {d.sella_essential ? '*' : ''}
        </td>
        <td>
          {d.sella_code == 30001 && d.additional ? (
            <span className="tag">매체 기본 수수료 {d.additional}%</span>
          ) : (
            <>
              {d.title}
              {' ('}
              {d.column}
              {'열)'}
            </>
          )}
          {(d.sella_code == 30047 || d.sella_code == 30032 || d.sella_code == 30033) && (
            <span className="tag">
              ({d.sella_title} 수수료 {d.additional}%)
            </span>
          )}
        </td>
      </tr>
    )
  );
});

const FormItems = React.memo(({ index, d }) => {
  //logger.debug('FormManagement_Basic TableItem : ', index);
  return (
    <tr>
      {d.map((cell) => (
        <td>{cell}</td>
      ))}
    </tr>
  );
});

export default React.memo(FormManagement_Basic);
