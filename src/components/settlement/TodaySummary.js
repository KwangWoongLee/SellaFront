import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { page_reload, replace_1000, revert_1000, time_format, time_format_day } from 'util/com';
import Checkbox from 'components/common/CheckBoxCell';
import request from 'util/request';
import { modal } from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc.scss';
import 'styles/TodaySummary.scss';

import CustomCalendar from 'components/common/CustomCalendar';
import CommonDateModal from 'components/common/CommonDateModal';

const TodaySummary = () => {
  logger.render('TodaySummary');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;

  const [viewResult, setViewResult] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [selectedDayGroup, setSelectedDayGroup] = useState('');
  const [dayData, setDayData] = useState({});
  const [dateModalState, setDateModalState] = useState(false);
  //ag-grid
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  useEffect(() => {
    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    temp = _.sortBy(temp, ['_order']);
    setPlatforms(temp);

    request.post(`user/today_summary`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        if (data && data.length) {
          const dayGroupDatas = {};

          for (const event of data) {
            const day = time_format_day(event.reg_date);
            event.group = day;

            if (!dayGroupDatas[day]) {
              dayGroupDatas[day] = {
                group: day,
                start: new Date(event.reg_date),
                end: new Date(event.reg_date),
                title: 0,
                events: [],
              };
            }

            dayGroupDatas[day]['events'].push(event);
            dayGroupDatas[day]['title'] += revert_1000(event['sum_profit_loss']);
          }

          for (const key in dayGroupDatas) {
            if (dayGroupDatas[key].title) {
              let prefix = '';
              if (dayGroupDatas[key].title > 0) {
                prefix = '이익\n금액';
                dayGroupDatas[key].className = 'profit';
              } else {
                prefix = '손해\n금액';
                dayGroupDatas[key].className = 'loss';
              }

              dayGroupDatas[key].title = `${prefix} ${replace_1000(dayGroupDatas[key].title)}`;
            }
          }

          setDayData(_.cloneDeep(dayGroupDatas));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (dayData[selectedDayGroup]) setRowData(dayData[selectedDayGroup]['events']);
  }, [selectedDayGroup]);

  useEffect(() => {
    let summary = {
      unique_order_no_count: 0,
      delivery_send_count: 0,
      loss_order_no_count: 0,
      sum_payment_price: 0,
      sum_received_delivery_fee: 0,
      sum_profit_loss: 0,
    };

    if (rowData && rowData.length > 0) {
      summary = {
        unique_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'unique_order_no_count'))),
        delivery_send_count: replace_1000(revert_1000(_.sumBy(rowData, 'delivery_send_count'))),
        loss_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'loss_order_no_count'))),
        sum_payment_price: replace_1000(revert_1000(_.sumBy(rowData, 'sum_payment_price'))),
        sum_received_delivery_fee: replace_1000(revert_1000(_.sumBy(rowData, 'sum_received_delivery_fee'))),
        sum_profit_loss: replace_1000(revert_1000(_.sumBy(rowData, 'sum_profit_loss'))),
      };
    }

    setViewResult(summary);
  }, [rowData]);

  const onDelete = (e) => {
    const idxs = _.map(
      _.filter(rowData, (row) => {
        return row.checked;
      }),
      'idx'
    );

    if (!idxs.length) {
      modal.alert('선택된 데이터가 없습니다.');
      return;
    }

    request.post('user/today_summary/delete', { idxs }).then((ret) => {
      if (!ret.err) {
        setRowData(
          _.filter(rowData, (item) => {
            return !_.includes(idxs, item.idx);
          })
        );
      }
    });
  };

  const onChangeDate = (date) => {
    const idxs = _.map(
      _.filter(rowData, (row) => {
        return row.checked;
      }),
      'idx'
    );

    if (!idxs.length) {
      modal.alert('선택된 데이터가 없습니다.');
      return;
    }

    request.post('user/today_summary/modify', { idxs, date: new Date(date) }).then((ret) => {
      if (!ret.err) {
        page_reload();
      }
    });
  };

  // 체크박스 선택
  const handleSingleCheck = (idx, checked) => {
    const findObj = _.find(rowData, { idx: idx });
    findObj.checked = checked;

    setRowData([...rowData]);
  };

  // 체크박스 전체 선택
  const handleAllCheck = (checked) => {
    for (const row of rowData) {
      row.checked = checked;
    }

    setRowData([...rowData]);
  };

  return (
    <>
      <Head />
      <Body title={`손익 캘린더`} myClass={'today_summary'}>
        <SettlementNavTab active="/settlement/today_summary" />

        <div className="page">
          <div className="section1">
            <div className="viewboxWrap">
              <h4>9월 손익 합계</h4>
              <ul className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
                <li>
                  <p className="dt">총 주문</p>
                  <p className="dd">
                    {viewResult.unique_order_no_count}
                    <span>건</span>
                  </p>
                </li>
                <li>
                  <p className="dt">택배 발송</p>
                  <p className="dd">
                    {viewResult.delivery_send_count}
                    <span>건</span>
                  </p>
                </li>
                <li>
                  <p className="dt">적자 주문</p>
                  <span className="dd txt_red">
                    {viewResult.loss_order_no_count}
                    <span className="unit txt_red">건</span>
                  </span>
                </li>
                <li>
                  <p className="dt">상품 결제 금액</p>
                  <p className="dd">
                    {viewResult.sum_payment_price}
                    <span>원</span>
                  </p>
                </li>
                <li>
                  <p className="dt">받은 배송비</p>
                  <p className="dd">
                    {viewResult.sum_received_delivery_fee}
                    <span>원</span>
                  </p>
                </li>
                <li className={viewResult && revert_1000(viewResult.sum_profit_loss) > 0 ? 'profit' : 'loss'}>
                  <p className="dt">손익 합계</p>
                  <p className="dd">
                    {viewResult.sum_profit_loss}
                    <span>원</span>
                  </p>
                </li>
              </ul>
            </div>
            <CustomCalendar
              dayGroupDatas={dayData}
              selectCallback={(e) => {
                setSelectedDayGroup(e.group);
              }}
            ></CustomCalendar>
          </div>

          <div className="section2">
            <div className="btnbox">
              <Button variant="primary" onClick={onDelete} className="btn_red">
                선택 삭제
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setDateModalState(true);
                }}
              >
                선택한 주문서 날짜 변경
              </Button>
            </div>

            <div className="viewboxWrap">
              <h4>2023년 9월 06일 손익 합계</h4>
              <ul className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
                <li>
                  <p className="dt">총 주문</p>
                  <p className="dd">
                    {viewResult.unique_order_no_count}
                    <span>건</span>
                  </p>
                </li>
                <li>
                  <p className="dt">택배 발송</p>
                  <p className="dd">
                    {viewResult.delivery_send_count}
                    <span>건</span>
                  </p>
                </li>
                <li>
                  <p className="dt">적자 주문</p>
                  <span className="dd txt_red">
                    {viewResult.loss_order_no_count}
                    <span className="unit txt_red">건</span>
                  </span>
                </li>
                <li>
                  <p className="dt">상품 결제 금액</p>
                  <p className="dd">
                    {viewResult.sum_payment_price}
                    <span>원</span>
                  </p>
                </li>
                <li>
                  <p className="dt">받은 배송비</p>
                  <p className="dd">
                    {viewResult.sum_received_delivery_fee}
                    <span>원</span>
                  </p>
                </li>
                <li className={viewResult && revert_1000(viewResult.sum_profit_loss) > 0 ? 'profit' : 'loss'}>
                  <p className="dt">손익 합계</p>
                  <p className="dd">
                    {viewResult.sum_profit_loss}
                    <span>원</span>
                  </p>
                </li>
              </ul>
            </div>

            <div style={containerStyle} className="tablebox">
              <table className="thead">
                <thead>
                  <tr>
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
                    <th>업로드 시간</th>
                    <th>매체</th>
                    <th>
                      주문 수
                      <br />
                      택배발송 수
                    </th>
                    <th>
                      총 결제금액
                      <br />
                      받은 배송비
                    </th>
                    <th>손익합계</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
              <table className="tbody">
                <thead></thead>
                <tbody>
                  {rowData &&
                    rowData.map((d, key) => (
                      <SummaryRow
                        rowChecked={d.checked}
                        handleSingleCheck={handleSingleCheck}
                        key={key}
                        index={key}
                        d={d}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Body>
      <Footer />

      <CommonDateModal
        modalState={dateModalState}
        setModalState={setDateModalState}
        onChangeDate={onChangeDate}
      ></CommonDateModal>
    </>
  );
};

const SummaryRow = React.memo(({ handleSingleCheck, rowChecked, d }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(rowChecked);
  }, [rowChecked]);

  const checkedItemHandler = (e) => {
    handleSingleCheck(d.idx, !checked);
    setChecked(!checked);
  };

  return (
    <tr>
      <td>
        <Checkbox checked={checked} checkedItemHandler={checkedItemHandler}></Checkbox>
      </td>
      <td>{time_format(d.reg_date)}</td>
      <td>{d.forms_name}</td>
      <td>
        {replace_1000(d.unique_order_no_count)}
        <br />
        {replace_1000(d.delivery_send_count)}
      </td>
      <td>
        {replace_1000(d.sum_payment_price)}
        <br />
        {replace_1000(d.sum_received_delivery_fee)}
      </td>
      <td>{replace_1000(d.sum_profit_loss)}</td>
    </tr>
  );
});

export default React.memo(TodaySummary);
