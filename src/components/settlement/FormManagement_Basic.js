import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import * as xlsx from 'xlsx';

import { logger } from 'util/com';
import _ from 'lodash';

import 'styles/FormManagement.scss';

const FormManagement_Basic = (param) => {
  logger.render('FormManagement_Basic');

  const { platform } = param;

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;
  const [formData, setFormData] = useState(null);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const basic_form = platform;
    const basic_form_rows = [];
    const column_row = [''];
    const header_row = [`${basic_form.title_row}`];
    const titles = basic_form.title_array.split(', ');
    for (const ts of titles) {
      const title_splits = ts.split('(');
      const header = title_splits[0];
      const match_data = title_splits[1].split(')')[0];
      const column = match_data.split(':')[0]; //
      const sella_code = match_data.split(':')[1];
      column_row.push(column);
      header_row.push(header);
    }
    basic_form_rows.push(column_row);
    for (let i = 1; i < basic_form.title_row; ++i) {
      const empty_row = [`${i}`];
      for (let j = 0; j < header_row.length - 1; ++j) empty_row.push('');
      basic_form_rows.push(empty_row);
    }
    basic_form_rows.push(header_row);

    setRowData(basic_form_rows);
  }, []);

  const onDownload = () => {
    if (!formData) return;
  };

  return (
    <>
      {platform && (
        <>
          <span>{platform.name} - 양식 확인</span> <Button onClick={onDownload}>엑셀 양식 다운로드</Button>
          <div>
            제목행 : {platform.title_row}번째 / 주문 시작 행 : {platform.start_row}번째 / 끝에서부터 제거할 행의 개수 :{' '}
            {platform.end_row}줄
            <table className="section">
              <caption></caption>
              <thead></thead>
              <tbody>
                {rowData && rowData.map((d, key) => <FormItems key={key} index={key} d={d} />)}
                <></>
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

const FormItems = React.memo(({ index, d }) => {
  logger.render('FormManagement_Basic TableItem : ', index);
  return (
    <tr>
      {d.map((cell) => (
        <td>{cell}</td>
      ))}
    </tr>
  );
});

export default React.memo(FormManagement_Basic);
