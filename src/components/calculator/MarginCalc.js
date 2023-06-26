import React, { useState, useEffect } from 'react';

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

import 'styles/Settlement.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import icon_set from 'images/icon_set.svg';

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const platforms = Recoils.useValue('DATA:PLATFORMS');
  const aidx = account.aidx;
  const [viewState, setView] = useState(true);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [modalState, setModalState] = useState(false);

  useEffect(() => {}, []);

  const onUpload = function () {
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

  const onClick = (e) => {
    switch (e.detail) {
      case 1: {
        break;
      }
      case 2: {
        setModalState(true);
        break;
      }
      case 3: {
        break;
      }
      default: {
        break;
      }
    }
  };

  const deleteCallback = (d) => {
    setRowData(
      _.filter(rowData, (item) => {
        return item.order_no != d.order_no;
      })
    );
  };

  return (
    <>
      <Head />

      <Body title={`손익 계산`} myClass={'margin_calc'}>
        <SettlementNavTab active="/settlement/margin_calc" />
        <div className="page">
          {viewState ? (
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

              <Button variant="primary" onClick={onUpload} className="btn_blue">
                손익 계산
              </Button>

              <Button variant="primary" onClick={onUpload}>
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
          <div className="tablebox">
            <table>
              <thead>
                <th></th>
                <th>연결상태</th>
                <th>손익</th>
                <th>결제일</th>
                <th>주문번호</th>
                <th>매체</th>
                <th>판매상품명</th>
                <th>옵션</th>
                <th>주문수량</th>
                <th>총 결제금액</th>
                <th>입고단가</th>
                <th>배송비</th>
                <th>포장비</th>
                <th>수취인명</th>
                <th>수취인주소</th>
                <th>수취인연락처</th>
              </thead>
              <tbody>
                {rowData &&
                  rowData.map((d, key) => (
                    <MarginCalcItems
                      key={key}
                      index={key}
                      d={d}
                      onClick={onClick}
                      platform_name={platforms[platformType].name}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Body>
      <Footer />
      <MarginCalc_UnConnectModal
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        callback={deleteCallback}
      ></MarginCalc_UnConnectModal>
    </>
  );
};

const MarginCalcItems = React.memo(({ index, d, platform_name, onClick }) => {
  logger.render('MarginCalc TableItem : ', index);
  return (
    <tr onClick={onClick}>
      <td></td>
      <td>{d.connect_flag ? '연결' : '미연결'}</td>
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
    </tr>
  );
});

export default React.memo(MarginCalc);
