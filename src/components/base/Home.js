import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, navigate } from 'util/com';
import request from 'util/request';

import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import Recoils from 'recoils';
import * as xlsx from 'xlsx';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/Home.scss';

import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import img_service from 'images/img_service.png';

const Home = () => {
  logger.render('Home');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;
  const [viewResult, setViewResult] = useState(false);
  const [viewState, setView] = useState(true);
  const [platforms, setPlatforms] = useState([]);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [columnControlModalState, setColumnControlModalState] = useState(false);

  useEffect(() => {
    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    temp = _.sortBy(temp, ['_order']);
    setPlatforms(temp);
  }, []);

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

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'home'}>
        <SettlementNavTab active="" />

        <div className="page">
          <div className="section1">
            <h3>
              주문서를 업로드하고 손익을 관리하세요!
              <p>
                오늘 들어온 주문, <span className="txt_red">순이익</span>은 얼마인가요?
              </p>
            </h3>

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
              <span>※ 신규 접수된 '배송준비중' 인 양식을 사용해주세요.</span>
            </div>

            <ul>
              <li>판매 매체별 주문정보로 손익을 계산할 수 있습니다.</li>
              <li>적자 상품을 찾아 판매 가격을 수정하세요.</li>
              <li>오늘 업로드한 주문서를 모아서 하루동안 손익을 파악하세요.</li>
            </ul>
          </div>
          <div className="section2">
            <img src={img_service} />
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

for (const name in process.env) {
  logger.info(`${name} = ${process.env[name]}`);
}

export default React.memo(Home);
