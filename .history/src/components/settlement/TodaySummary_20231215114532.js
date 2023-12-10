import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {
  page_reload,
  replace_1000,
  revert_1000,
  time_format_none_day,
  time_format_day,
  time_format_date_time,
} from 'util/com';
import com, { img_src } from 'util/com';
import request from 'util/request';
import { modal } from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';
import { useMediaQuery } from 'react-responsive';

import 'styles/MarginCalc.scss';
import 'styles/TodaySummary.scss';

import CustomCalendar from 'components/common/CustomCalendar';
import CommonDateModal from 'components/common/CommonDateModal';

import icon_del from 'images/icon_del.svg';
import icon_date from 'images/icon_date.svg';
import MobileRefuser from 'components/template/MobileRefuser';
const TodaySummary = () => {
  //logger.debug('TodaySummary');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;

  const [viewResult, setViewResult] = useState(false);
  const [monthViewResult, setMonthViewResult] = useState({});
  const [platforms, setPlatforms] = useState([]);
  const [platformType, setPlatformType] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [selectButton, setSelectButton] = useState(0);
  const [selectedDayGroup, setSelectedDayGroup] = useState('');
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState({});
  const [dateModalState, setDateModalState] = useState(false);
  const [except, setExcept] = useState('');

  const selectRowDataIdxRef = useRef(null);

  const isMobile = useMediaQuery({
    query: '(max-width:1024px)',
  });

  useEffect(() => {
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
                prefix = '';
                dayGroupDatas[key].className = 'profit';
              } else {
                prefix = '';
                dayGroupDatas[key].className = 'loss';
              }

              dayGroupDatas[key].title = `${prefix} ${replace_1000(dayGroupDatas[key].title)}`;
            }
          }

          setDayData(_.cloneDeep(dayGroupDatas));

          {
            let monthSummary = {
              unique_order_no_count: 0,
              delivery_send_count: 0,
              loss_order_no_count: 0,
              sum_payment_price: 0,
              sum_received_delivery_fee: 0,
              sum_profit_loss: 0,
            };

            const calendarDate = new Date(calendarCurrentDate);

            const equalMonthGroupDatas = _.filter(data, (d) => {
              const startDate = new Date(d.reg_date);
              const year = startDate.getYear();
              const month = startDate.getMonth();

              return year === calendarDate.getYear() && month === calendarDate.getMonth();
            });

            monthSummary = {
              unique_order_no_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'unique_order_no_count'))),
              delivery_send_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'delivery_send_count'))),
              loss_order_no_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'loss_order_no_count'))),
              sum_payment_price: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_payment_price'))),
              sum_received_delivery_fee: replace_1000(
                revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_received_delivery_fee'))
              ),
              sum_profit_loss: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_profit_loss'))),
            };

            setMonthViewResult(monthSummary);
          }
        }

        setRawData(data);
        const now = Date.now();
        const day = time_format_day(new Date(now));
        setSelectedDayGroup(day);
      }
    });
  }, []);

  useEffect(() => {
    if (dayData[selectedDayGroup]) {
      setRowData(dayData[selectedDayGroup]['events']);
      const forms_names = _.uniq(_.map(dayData[selectedDayGroup]['events'], 'forms_name'));
      forms_names.unshift('전체');
      setPlatforms(forms_names);
      setExcept('');
    } else {
      setExcept('저장된 주문서가 없습니다.');
    }
  }, [selectedDayGroup]);

  useEffect(() => {
    if (dayData[selectedDayGroup]) {
      const rowData = dayData[selectedDayGroup]['events'];
      if (platformType === 0) {
        setRowData(dayData[selectedDayGroup]['events']);
        return;
      }

      setRowData(() => _.filter(rowData, (row) => row.forms_name === platforms[platformType]));
    }
  }, [platformType]);

  useEffect(() => {
    if (!rawData || !rawData.length) return;

    {
      let monthSummary = {
        unique_order_no_count: 0,
        delivery_send_count: 0,
        loss_order_no_count: 0,
        sum_payment_price: 0,
        sum_received_delivery_fee: 0,
        sum_profit_loss: 0,
      };

      const calendarDate = new Date(calendarCurrentDate);

      const equalMonthGroupDatas = _.filter(rawData, (d) => {
        const startDate = new Date(d.reg_date);
        const year = startDate.getYear();
        const month = startDate.getMonth();

        return year === calendarDate.getYear() && month === calendarDate.getMonth();
      });

      monthSummary = {
        unique_order_no_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'unique_order_no_count'))),
        delivery_send_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'delivery_send_count'))),
        loss_order_no_count: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'loss_order_no_count'))),
        sum_payment_price: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_payment_price'))),
        sum_received_delivery_fee: replace_1000(
          revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_received_delivery_fee'))
        ),
        sum_profit_loss: replace_1000(revert_1000(_.sumBy(equalMonthGroupDatas, 'sum_profit_loss'))),
      };

      setMonthViewResult(monthSummary);
    }
  }, [calendarCurrentDate]);

  useEffect(() => {
    let summary = {
      unique_order_no_count: 0,
      delivery_send_count: 0,
      loss_order_no_count: 0,
      sum_payment_price: 0,
      sum_received_delivery_fee: 0,
      sum_delivery_fee: 0,
      sum_profit_loss: 0,
    };

    if (rowData && rowData.length > 0) {
      summary = {
        unique_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'unique_order_no_count'))),
        delivery_send_count: replace_1000(revert_1000(_.sumBy(rowData, 'delivery_send_count'))),
        loss_order_no_count: replace_1000(revert_1000(_.sumBy(rowData, 'loss_order_no_count'))),
        sum_payment_price: replace_1000(revert_1000(_.sumBy(rowData, 'sum_payment_price'))),
        sum_received_delivery_fee: replace_1000(revert_1000(_.sumBy(rowData, 'sum_received_delivery_fee'))),
        sum_delivery_fee: replace_1000(revert_1000(_.sumBy(rowData, 'sum_delivery_fee'))),
        sum_profit_loss: replace_1000(revert_1000(_.sumBy(rowData, 'sum_profit_loss'))),
      };
    }

    setViewResult(summary);
  }, [rowData]);

  const onDelete = (e) => {
    const idxs = [selectRowDataIdxRef.current];

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
    const idxs = [selectRowDataIdxRef.current];

    if (!idxs.length) {
      modal.alert('선택된 데이터가 없습니다.');
      return;
    }

    const findObj = _.find(rowData, { idx: selectRowDataIdxRef.current });
    if (!findObj) {
      modal.alert('선택된 데이터가 없습니다.');
      return;
    }

    const date_only_time = time_format_date_time(findObj.reg_date);
    request.post('user/today_summary/modify', { idxs, date: `${date} ${date_only_time}` }).then((ret) => {
      if (!ret.err) {
        page_reload();
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`손익 캘린더`} myClass={'today_summary'}>
        <SettlementNavTab active="/settlement/today_summary" />

        <div className="page">
          {isMobile ? (
            <MobileRefuser></MobileRefuser>
          ) : (
            <>
              <div className="section1">
                <div className="viewboxWrap">
                  <h4>월별 판매 이익</h4>
                  <ul className={!_.isEmpty(monthViewResult) ? 'viewbox' : 'viewbox off'}>
                    <li>
                      <p className="dt">총 주문</p>
                      <p className="dd">
                        {monthViewResult.unique_order_no_count}
                        <span>건</span>
                      </p>
                    </li>
                    <li>
                      <p className="dt">택배 발송</p>
                      <p className="dd">
                        {monthViewResult.delivery_send_count}
                        <span>건</span>
                      </p>
                    </li>
                    {/* <li>
                      <p className="dt">적자 주문</p>
                      <span className="dd txt_red">
                        {monthViewResult.loss_order_no_count}
                        <span className="unit txt_red">건</span>
                      </span>
                    </li> */}
                    <li>
                      <p className="dt">상품 결제 금액</p>
                      <p className="dd">
                        {monthViewResult.sum_payment_price}
                        <span>원</span>
                      </p>
                    </li>
                    <li>
                      <p className="dt">받은 배송비</p>
                      <p className="dd">
                        {monthViewResult.sum_received_delivery_fee}
                        <span>원</span>
                      </p>
                    </li>
                    <li
                      className={
                        !_.isEmpty(monthViewResult) && revert_1000(monthViewResult.sum_profit_loss) > 0
                          ? 'profit'
                          : 'loss'
                      }
                    >
                      <p className="dt">판매 이익</p>
                      <p className="dd">
                        {monthViewResult.sum_profit_loss}
                        <span>원</span>
                      </p>
                    </li>
                  </ul>
                </div>
                <CustomCalendar
                  dayGroupDatas={dayData}
                  selectCallback={(e, selectDay) => {
                    if (e) setSelectedDayGroup(e.group);
                    else {
                      setSelectedDayGroup(selectDay);
                      setExcept('저장된 주문서가 없습니다.');

                      let summary = {
                        unique_order_no_count: 0,
                        delivery_send_count: 0,
                        loss_order_no_count: 0,
                        sum_payment_price: 0,
                        sum_received_delivery_fee: 0,
                        sum_delivery_fee: 0,
                        sum_profit_loss: 0,
                      };

                      setViewResult(summary);
                    }
                  }}
                  setCalendarCurrentDate={setCalendarCurrentDate}
                ></CustomCalendar>
              </div>

              <div className="section3">
                <h4>
                  {selectedDayGroup}
                  <span>주문서 리스트</span>
                </h4>
                <div className="inputbox">
                  <div className="btngroup">
                    <Button
                      className={selectButton === 0 ? 'btn_blue on' : 'btn_blue'}
                      onClick={() => {
                        setSelectButton(0);
                        if (dayData[selectedDayGroup]) setRowData(dayData[selectedDayGroup]['events']);
                      }}
                    >
                      전체
                    </Button>
                    <Button
                      className={selectButton === 1 ? 'btn_green on' : 'btn_green'}
                      onClick={() => {
                        setSelectButton(1);
                        if (dayData[selectedDayGroup]) {
                          const rowData = dayData[selectedDayGroup]['events'];
                          setRowData(() => _.filter(rowData, (row) => row.sum_profit_loss >= 0));
                        }
                      }}
                    >
                      이익
                    </Button>
                    <Button
                      className={selectButton === 2 ? 'btn_red on' : 'btn_red'}
                      onClick={() => {
                        setSelectButton(2);
                        if (dayData[selectedDayGroup]) {
                          const rowData = dayData[selectedDayGroup]['events'];
                          setRowData(() => _.filter(rowData, (row) => row.sum_profit_loss < 0));
                        }
                      }}
                    >
                      손해
                    </Button>
                  </div>

                  <DropdownButton variant="" title={platforms && platforms[platformType]} className="inputagency">
                    {platforms.map((name, key) => (
                      <Dropdown.Item
                        key={key}
                        eventKey={key}
                        onClick={(e) => {
                          setPlatformType(key);
                        }}
                        active={platformType === key}
                      >
                        {platforms[key]}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
                <div className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
                  <div className="innerbox left">
                    <ul>
                      <li className="txt_blue">
                        <b>전체</b> {dayData[selectedDayGroup] ? dayData[selectedDayGroup]['events'].length : 0}
                      </li>
                      <li className="txt_green">
                        <b>이익</b>
                        {dayData[selectedDayGroup]
                          ? _.filter(dayData[selectedDayGroup]['events'], (row) => row.sum_profit_loss >= 0).length
                          : 0}
                      </li>
                      <li className="txt_red">
                        <b>손해</b>
                        {dayData[selectedDayGroup]
                          ? _.filter(dayData[selectedDayGroup]['events'], (row) => row.sum_profit_loss < 0).length
                          : 0}
                      </li>
                    </ul>
                  </div>

                  <div className="innerbox right">
                    <ul>
                      <li className="txt_blue">
                        <b>총 주문 수</b>
                        {viewResult.unique_order_no_count} <i>건</i>
                      </li>
                      <li className="txt_blue">
                        <b>택배 발송</b>
                        {viewResult.delivery_send_count} <i>건</i>
                      </li>
                      <li className="txt_blue">
                        <b>총 결제금액</b>
                        {viewResult.sum_payment_price} <i>원</i>
                      </li>
                      <li className="txt_blue">
                        <b>받은 배송비</b>
                        {viewResult.sum_received_delivery_fee} <i>원</i>
                      </li>
                      <li className="txt_green">
                        <b>손익 합계</b>
                        {viewResult.sum_profit_loss} <i>원</i>
                      </li>
                    </ul>
                  </div>
                </div>
                <ul className="listbox">
                  {except === '' ? (
                    rowData &&
                    rowData.map((d, key) => (
                      <SummaryRow
                        key={key}
                        index={key}
                        d={d}
                        setDateModalState={setDateModalState}
                        onDelete={onDelete}
                        selectRowDataIdxRef={selectRowDataIdxRef}
                      />
                    ))
                  ) : (
                    <span>{except}</span>
                  )}
                </ul>{' '}
              </div>
            </>
          )}
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

const SummaryRow = React.memo(({ d, setDateModalState, onDelete, selectRowDataIdxRef }) => {
  return (
    <li className={d.sum_profit_loss >= 0 ? 'green' : 'red'}>
      <p>
        <b>{time_format_none_day(d.reg_date)}</b>
        {d.forms_name}
      </p>
      <ol>
        <li>
          <b>총 주문 수</b>
          {replace_1000(d.unique_order_no_count)} <i>건</i>
        </li>
        <li>
          <b>택배발송</b>
          {d.delivery_send_count} <i>건</i>
        </li>
        <li>
          <b>총 결제금액</b>
          {replace_1000(d.sum_payment_price)} <i>원</i>
        </li>
        <li>
          <b>받은 배송비</b>
          {replace_1000(d.sum_received_delivery_fee)} <i>원</i>
        </li>
        <li>
          <b>손익 합계</b>
          {replace_1000(d.sum_profit_loss)} <i>원</i>
        </li>
        <li className="btnbox">
          <Button
            className="btn_date_2"
            variant="primary"
            onClick={() => {
              selectRowDataIdxRef.current = d.idx;
              setDateModalState(true);
            }}
          >
            {/* <img src={`${img_src}${icon_date}`} /> */}
            날짜변경
          </Button>
          <Button
            className="btn_del"
            onClick={() => {
              selectRowDataIdxRef.current = d.idx;
              onDelete();
            }}
          >
            <img src={`${img_src}${icon_del}`} />
          </Button>
        </li>
      </ol>
    </li>
  );
});

export default React.memo(TodaySummary);
