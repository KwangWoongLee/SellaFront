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

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';

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
    const titles = basic_form.titles;
    for (const title of titles) {
      const header = title.title;
      const column = title.column;
      const sella_code = title.sella_code;
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
          <h3>{platform.name} - 양식 확인</h3>
          <Button variant="primary" onClick={onDownload} className="btn_green">
            <img src={icon_circle_arrow_down} />
            엑셀 양식 다운로드
          </Button>
          <div className="tablebox">
            <p>
              <span>제목행</span> : {platform.title_row}번째 / <span>주문 시작 행</span> : {platform.start_row}번째 /{' '}
              <span>끝에서부터 제거할 행의 개수</span> : {platform.end_row}줄
            </p>

            <div className="innerbox">
              {/* 이부분 출력할 테이블 열이 옆으로 길어지면 가로스크롤이 생겨야하는데, 지금은 이정도로만 작업해둘게요! 실제 데이터 많이 들어갈때 모습 보고 만들겠습니다! */}
              <table className="table_front">
                <tbody>
                  {rowData && rowData.map((d, key) => <FormItems key={key} index={key} d={d} />)}
                  <></>
                </tbody>
              </table>
            </div>
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
