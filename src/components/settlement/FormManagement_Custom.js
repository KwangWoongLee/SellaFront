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
  logger.render('FormManagement_Custom');

  let { platform } = param;

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const sella_forms = Recoils.useValue('SELLA:SELLAFORMS');

  const [rowData, setRowData] = useState([]);
  const nameRef = useRef('');

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
    nameRef.current.value = platform.name;
  }, [platform]);

  return (
    <>
      <div>
        <span>
          매체명
          <input type={'text'} disabled ref={nameRef}></input>
        </span>
        <table className="section">
          <caption></caption>
          <thead>
            <th>셀라 표준 항목</th>
            <th>선택한 엑셀 항목</th>
          </thead>
          <tbody>
            {rowData && rowData.map((d, key) => <SellaForm key={d.idx} index={key} d={d} />)}
            <></>
          </tbody>
        </table>
      </div>
    </>
  );
};

const SellaForm = React.memo(({ index, d }) => {
  logger.render('SellaForm TableItem : ', index);
  return (
    <tr>
      <td>
        {d.sella_title} {d.sella_essential ? '*' : ''}
      </td>
      <td>
        {d.title}
        {' ('}
        {d.column}
        {'열)'}
      </td>
    </tr>
  );
});

export default React.memo(FormManagement_Custom);
