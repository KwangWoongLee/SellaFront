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

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//

import 'styles/FormManagement.scss';

const FormManagement_Custom = (param) => {
  //logger.debug('FormManagement_Custom');

  let { platform } = param;

  const sella_forms = Recoils.useValue('SELLA:SELLAFORMS');

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const rowData = [];

    for (const sella_form of sella_forms) {
      const find_platform_data = _.find(platform.titles, { sella_code: sella_form.code });
      if (find_platform_data) {
        const my_platform_data = _.cloneDeep(find_platform_data);
        my_platform_data.sella_title = sella_form.title;
        my_platform_data.sella_essential = sella_form.essential_flag;
        rowData.push(my_platform_data);
      }
    }

    setRowData(rowData);
  }, [platform]);

  return (
    <>
      <div className="leftbox read">
        <h3>{platform.name} - 양식 확인</h3>
        <table className="thead">
          <thead>
            <th>셀라 표준 항목</th>
            <th>선택한 엑셀 항목</th>
          </thead>
        </table>
        <table className="tbody">
          <tbody>
            {rowData && rowData.map((d, key) => <SellaForm key={d.idx} index={key} d={d} />)}
            <></>
          </tbody>
        </table>
      </div>
      <div className="rightbox"></div>
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

export default React.memo(FormManagement_Custom);
