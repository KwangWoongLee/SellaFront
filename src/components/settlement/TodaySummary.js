import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { page_reload, replace_1000, revert_1000, time_format, time_format_day } from 'util/com';
import Checkbox from 'components/common/CheckBoxCell';
import com, { img_src } from 'util/com';
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

import icon_del from 'images/icon_del.svg';
import icon_date from 'images/icon_date.svg';
const TodaySummary = () => {
  //logger.debug('TodaySummary');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;

  const [viewResult, setViewResult] = useState(false);
  const [monthViewResult, setMonthViewResult] = useState({});
  const [platforms, setPlatforms] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [selectedDayGroup, setSelectedDayGroup] = useState('');
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
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
                prefix = '이익\n+ ';
                dayGroupDatas[key].className = 'profit';
              } else {
                prefix = '손해\n ';
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
      }
    });
  }, []);

  useEffect(() => {
    if (dayData[selectedDayGroup]) setRowData(dayData[selectedDayGroup]['events']);
  }, [selectedDayGroup]);

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
              <h4>월별 손익 합계</h4>
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
                <li>
                  <p className="dt">적자 주문</p>
                  <span className="dd txt_red">
                    {monthViewResult.loss_order_no_count}
                    <span className="unit txt_red">건</span>
                  </span>
                </li>
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
                    !_.isEmpty(monthViewResult) && revert_1000(monthViewResult.sum_profit_loss) > 0 ? 'profit' : 'loss'
                  }
                >
                  <p className="dt">손익 합계</p>
                  <p className="dd">
                    {monthViewResult.sum_profit_loss}
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
                <Button className="btn_blue on">전체</Button>
                <Button className="btn_green">이익</Button>
                <Button className="btn_red">손해</Button>
              </div>
              <select name="" id="">
                <option value="">매체명</option>
              </select>
            </div>
            <div className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
              <div className="innerbox left">
                <ul>
                  <li className="txt_blue">
                    <b>전체</b>
                    {viewResult.unique_order_no_count}
                  </li>
                  <li className="txt_green">
                    <b>이익</b>
                    {viewResult.unique_order_no_count - viewResult.loss_order_no_count}
                  </li>
                  <li className="txt_red">
                    <b>손해</b>
                    {viewResult.loss_order_no_count}
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
                    <b>택배 발송</b>
                    {viewResult.sum_delivery_fee} <i>원</i>
                  </li>
                </ul>
              </div>
            </div>
            <ul className="listbox">
              <li className="green">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="red">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="green">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="red">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="green">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="red">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="green">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
              <li className="red">
                <p>
                  <b>오전 7:28:22</b>네이버 스마트 스토어
                </p>
                <ol>
                  <li>
                    <b>총 주문 수</b>99999999 <i>건</i>
                  </li>
                  <li>
                    <b>택배발송</b>99,999,600 <i>건</i>
                  </li>
                  <li>
                    <b>총 결제금액</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>받은 배송비</b>99,999,600 <i>원</i>
                  </li>
                  <li>
                    <b>손익 합계</b>+ 99,999,600 <i>원</i>
                  </li>
                  <li className="btnbox">
                    <Button
                      className="btn_date"
                      variant="primary"
                      onClick={() => {
                        setDateModalState(true);
                      }}
                    >
                      <img src={`${img_src}${icon_date}`} />
                    </Button>
                    <Button className="btn_del" onClick={onDelete}>
                      <img src={`${img_src}${icon_del}`} />
                    </Button>
                  </li>
                </ol>
              </li>
            </ul>{' '}
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
      <td>
        {replace_1000(d.unique_order_no_count)}
        <br />
        <span className="subtxt">({replace_1000(d.delivery_send_count)})</span>
      </td>
      <td>
        {replace_1000(d.sum_payment_price)}
        <br />
        <span className="subtxt">({replace_1000(d.sum_received_delivery_fee)})</span>
      </td>
      <td>{replace_1000(d.sum_profit_loss)}</td>
      <td>{time_format(d.reg_date)}</td>
      <td>{d.forms_name}</td>
    </tr>
  );
});

export default React.memo(TodaySummary);
