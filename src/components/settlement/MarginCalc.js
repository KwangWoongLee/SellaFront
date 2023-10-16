import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Table, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import Checkbox from 'components/common/CheckBoxCell';
import com, { img_src, modal, navigate } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import MarginCalc_ConnectModal from 'components/settlement/MarginCalc_ConnectModal';
import MarginCalc_UnConnectModal from 'components/settlement/MarginCalc_UnConnectModal';
import {
  SumPLRenderer,
  PLRenderer,
  _30006Renderer,
  _30047Renderer,
  OptionCellRenderer,
} from 'components/settlement/MarginCalc_Renderer';
import Recoils from 'recoils';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import moment from 'moment';

import { logger, replace_1000, revert_1000, time_format, time_format_none_time } from 'util/com';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import 'styles/MarginCalc.scss';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';
import img_service from 'images/img_service.png';

const MarginCalc = () => {
  logger.render('MarginCalc');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const access_token = account.access_token;
  const [mode, setMode] = useState(0);
  const [viewResult, setViewResult] = useState({});
  const [platforms, setPlatforms] = useState([]);
  const [platformType, setplatformType] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [announcement, setAnnouncement] = useState([]);
  const [stockPriceModalState, setStockPriceModalState] = useState(false);
  const [connectModalState, setConnectModalState] = useState(false);
  const [unConnectModalState, setUnConnectModalState] = useState(false);
  const [connectModalSelectData, setConnectModalSelectData] = useState({});
  const [unConnectModalSelectData, setUnConnectModalSelectData] = useState({});
  const [sliderState, setSliderState] = useState(false);

  const lastRowDatasRef = useRef(null);
  const stockPriceDataRef = useRef(null);
  //ag-grid
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);

  useEffect(() => {
    request.post(`cscenter/announcement`, { category: '', title: '' }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        if (data) {
          const len = data.length > 5 ? 5 : data.length;
          const announcement_data = _.slice(data, 0, len);
          setAnnouncement(announcement_data);
        }
      }
    });
  }, []);

  useEffect(() => {
    // GO Step2
    const goodsData = Recoils.getState('DATA:GOODS');

    if (!goodsData || goodsData.length == 0) {
      modal.confirm(
        '초기 값을 설정해 주세요.',
        [
          {
            strong: '',
            normal: '손익계산을 하시려면 [기준 상품 정보]를 등록해 주세요.',
          },
        ],
        [
          {
            name: '기준 상품 관리로 이동',
            callback: () => {
              navigate('step2');
            },
          },
        ]
      );
      return;
    }

    let temp = _.filter(Recoils.getState('DATA:PLATFORMS'), { view: 1 });
    if (!temp || temp.length == 0) {
      modal.confirm(
        '초기 값을 설정해 주세요.',
        [{ strong: '', normal: '손익계산을 하시려면 매체별 양식을 등록해 주세요.' }],
        [
          {
            name: '매체별 양식 관리로 이동',
            callback: () => {
              navigate('settlement/form_management');
            },
          },
        ]
      );

      return;
    }

    temp = _.sortBy(temp, ['_order']);

    setPlatforms(temp);
    setSliderState(true);
  }, []);

  useEffect(() => {
    setRowData([]);
    setViewResult({});
  }, [platforms, platformType]);

  const onUpload = function () {
    setRowData([]);
    setViewResult({});

    com.storage.setItem('exist_margin_calc_data', '');

    modal.file_upload(null, '.xlsx', '파일 업로드', { platform: platforms[platformType] }, (ret) => {
      if (!ret.err) {
        const { files } = ret;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
          const bstr = e.target.result;
          const wb = xlsx.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });

          const titles = _.cloneDeep(platforms[platformType].titles);
          const sella_forms = Recoils.getState('SELLA:SELLAFORMS');

          const expected = {};

          for (const title of titles) {
            const header = title.title;

            const column = title.column;
            expected[column] = header;
            const findObj = _.find(sella_forms, { code: title.sella_code });
            title.sella_title = findObj.title;
            title.sella_form_type = findObj.type;
          }
          // setViewColumns(titles);

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          const frm = new FormData();
          frm.append('files', file);
          frm.append('Authorization', access_token);
          frm.append('platform', JSON.stringify(platforms[platformType]));

          request
            .post_form('settlement/profit_loss', frm, () => {})
            .then((ret) => {
              if (!ret.err) {
                const { data } = ret.data;

                if (!data || !data.length) return;

                if (data && data.length > 0) {
                  com.storage.setItem('exist_margin_calc_data', '1');
                }

                if (unConnectModalState) return;

                const unconnect_rows = _.filter(data, (data) => {
                  return !data.connect_flag;
                });

                if (unconnect_rows.length != 0 && !connectModalState && !unConnectModalState) {
                  modal.confirm(
                    '',
                    [
                      {
                        strong: '미연결 주문건이 있습니다. 연결하시겠습니까?',
                        normal: '',
                      },
                    ],
                    [
                      {
                        name: '상품매칭관리',
                        className: 'btn_blue',
                        callback: () => {
                          setUnConnectModalSelectData({});
                          setUnConnectModalState(true);
                        },
                      },
                      {
                        name: '취소',
                        callback: () => {},
                      },
                    ]
                  );
                }

                if (data.length) {
                  let firstSize;
                  for (const row of data) {
                    if (row.group.first) {
                      firstSize = row.group.size;
                    } else {
                      row.group.size = firstSize;
                    }
                  }
                }
                setRowData(() => data);
                setMode(1);
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

  const onRowDoubleClick = (e, data) => {
    if (data) {
      if (data.connect_flag == true) {
        if (data.goods_match) {
          for (const goods_match of data.goods_match) {
            if (!goods_match.category_fee_rate) {
              goods_match.category_fee_rate = Number(data.category_fee_rate);
            }
          }
        }

        setConnectModalSelectData(data);
        setConnectModalState(true);
      } else {
        setUnConnectModalSelectData(data);
        setUnConnectModalState(true);
      }
    }
  };

  const onViewResult = () => {
    if (!rowData || !rowData.length) return;

    const unconnect_rows = _.filter(rowData, (data) => {
      return !data.connect_flag;
    });

    if (unconnect_rows.length != 0) {
      modal.confirm(
        '',
        [
          {
            strong: '손익계산을 진행하기 전 미연결 주문건을 삭제하시겠습니까?',
            normal: '',
          },
        ],
        [
          {
            name: '취소',
            callback: () => {},
          },
          {
            name: '미연결 주문건 삭제 후 손익계산',
            className: 'btn_blue',
            callback: () => {
              const changedRowDatas = _.cloneDeep(rowData);

              const connect_rows = _.filter(changedRowDatas, (data) => {
                return data.connect_flag;
              });

              for (const row of connect_rows) {
                if (!row.group.first) {
                  const firstObj = _.find(connect_rows, (cr) => {
                    return cr.group.first === true && cr.group.id === row.group.id;
                  });

                  if (!firstObj) {
                    const nextFirstObj = _.find(connect_rows, (cr) => {
                      return cr.group.first === false && cr.group.id === row.group.id;
                    });

                    nextFirstObj.group.first = true;
                  }
                }

                const eqGroupDatas = _.filter(connect_rows, (cr) => {
                  return cr.group.id === row.group.id;
                });

                row.group.size = eqGroupDatas.length;
              }
              const summary = CalcSummary(connect_rows);
              if (!summary) return;

              setViewResult(summary);
              setRowData([...connect_rows]);
              lastRowDatasRef.current = [...connect_rows];
            },
          },
        ]
      );
    } else {
      const summary = CalcSummary(rowData);
      if (!summary) return;

      setViewResult(summary);
      const lastRows = _.cloneDeep(rowData);
      setRowData(lastRows);
      lastRowDatasRef.current = [...lastRows];
    }
  };

  const onDownload = async () => {
    if (!rowData) return;
    if (!rowData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const columns = [];
    // for (const column of columnDefs) {
    //   if (column.field == '') continue;

    //   const toAddedColumn = {};
    //   toAddedColumn.header = column.headerName;
    //   toAddedColumn.key = column.field;
    //   toAddedColumn.width = 20;

    //   columns.push(toAddedColumn);
    // }
    worksheet.columns = columns;

    worksheet.addRows([...rowData]);

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    const time = moment().format('YYYYMMDDHHmmss');
    saveAs(blob, `주문서_${time}.xlsx`);
  };

  const onDelete = (e) => {
    const changedRowDatas = _.cloneDeep(rowData);
    const deleteRowDatas = _.filter(changedRowDatas, (row) => row.checked);
    const delete_arr = _.map(deleteRowDatas, 'idx');

    for (const deleteRowData of deleteRowDatas) {
      const size = deleteRowData.group.size - 1;
      const eqGroupDatas = _.filter(changedRowDatas, (row) => {
        return row.group.id === deleteRowData.group.id;
      });

      for (const eqGroupData of eqGroupDatas) {
        eqGroupData.group.size = size;
      }

      if (deleteRowData.group.first && eqGroupDatas.length > 1) {
        eqGroupDatas[1].group.first = true;
      }
    }

    const results = _.filter(changedRowDatas, (row) => {
      return !_.includes(delete_arr, row.idx);
    });

    setRowData([...results]);
  };

  const onSaveTodaySummary = () => {
    request.post(`user/today_summary/save`, { save_data: viewResult, date: null }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        navigate('settlement/today_summary');
      }
    });
  };

  const deleteCallback = (d, connect_flag) => {
    if (connect_flag) {
      const changedItems = _.cloneDeep(rowData);

      _.forEach(changedItems, (item) => {
        if (item.forms_match_idx === d.forms_match_idx) {
          item.connect_flag = false;
        }
      });

      setRowData([...changedItems]);
    } else {
      const changedItems = _.filter(rowData, (item) => {
        return !(item.forms_product_name == d.forms_product_name && item.forms_option_name == d.forms_option_name);
      });
      setRowData([...changedItems]);
    }
  };

  const saveCallback = (save_datas, result_forms_matchs) => {
    if (!save_datas) return;

    let saveResultData = _.cloneDeep(rowData);
    for (const d of save_datas) {
      const filteredDatas = _.filter(saveResultData, (item) => {
        return item.forms_product_name === d.forms_product_name && item.forms_option_name === d.forms_option_name;
      });

      const findFormsMatch = _.find(result_forms_matchs, (item) => {
        return item.forms_product_name === d.forms_product_name && item.forms_option_name === d.forms_option_name;
      });

      for (const obj of filteredDatas) {
        obj.connect_flag = findFormsMatch ? true : false;
        obj.forms_match_idx = findFormsMatch.idx;
        obj.goods_match = d.goods_match;
        obj.stock_price = getStockPrice(d);
        obj.delivery_fee = getDeliveryFee(d);
        obj.packing_fee = getPackingFee(d);

        obj.aggregation = getAggregation(obj);
        obj.reality_delivery_fee = getRealityDeliveryFee(obj);
        obj.assembly_fee = getAssemblyFee(obj);
        obj.installation_fee = getInstallationFee(obj);
      }
    }

    setRowData([...saveResultData]);
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
      <Body title={`손익 계산`} myClass={'margin_calc'}>
        <SettlementNavTab active="/settlement/margin_calc" />

        {mode == 0 && (
          <>
            <div className="page before">
              <div className="innerbox">
                <div className="noticebox">
                  <Slider
                    modalState={sliderState}
                    setModalState={setSliderState}
                    autoplay={true}
                    autoplaySpeed={6000}
                    dots={false}
                    slidesToShow={1}
                    slidesToScroll={1}
                    arrow={false}
                  >
                    {announcement &&
                      announcement.map((data, key) => (
                        <dl>
                          {/* <span>{data.announcement_category}</span>{' '} */}
                          <dt
                            onClick={() => {
                              com.storage.setItem('nav_announcement', data.idx);
                              navigate('/cscenter/announcement');
                            }}
                          >
                            {data.title}
                          </dt>{' '}
                          <dd>{time_format_none_time(data.reg_date)}</dd>
                        </dl>
                      ))}
                  </Slider>
                  <button
                    onClick={() => {
                      navigate('cscenter/announcement');
                    }}
                    className="btn-primary btn_more btn_more2"
                  ></button>
                </div>

                <div className="uploadbox">
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
                          platforms.map(
                            (item, key) =>
                              item.view && (
                                <Dropdown.Item
                                  key={key}
                                  eventKey={key}
                                  onClick={(e) => onChange(key, e)}
                                  active={platformType === key}
                                >
                                  {item.name}
                                </Dropdown.Item>
                              )
                          )}
                      </DropdownButton>
                      <Button variant="primary" onClick={onUpload} className="btn_green">
                        <img src={`${img_src}${icon_circle_arrow_up}`} />새 주문서 업로드
                      </Button>
                      <span>※ 신규 접수된 '배송준비중' 인 양식을 사용해주세요.</span>
                    </div>

                    <ul className="inform">
                      <li>판매 매체별 주문정보로 손익을 계산할 수 있습니다.</li>
                      <li>적자 상품을 찾아 판매 가격을 수정하세요.</li>
                      <li>오늘 업로드한 주문서를 모아서 하루동안 손익을 파악하세요.</li>
                    </ul>
                  </div>
                  <div className="section2">
                    <img src={`${img_src}${img_service}`} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {mode == 1 && (
          <>
            <div className="page after">
              <div className="inputbox">
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
                  <img src={`${img_src}${icon_circle_arrow_up}`} />새 주문서 업로드
                </Button>

                <div className="btnbox">
                  <Button variant="primary" onClick={onDelete} className="btn_red">
                    선택 삭제
                  </Button>

                  <Button
                    disabled={!rowData || !rowData.length}
                    variant="primary"
                    onClick={onViewResult}
                    className="btn_blue"
                  >
                    손익 계산
                  </Button>

                  {/* TODO 색 고민 해봐야.. */}

                  <Button onClick={onSaveTodaySummary} disabled={!rowData || !rowData.length || _.isEmpty(viewResult)}>
                    주문서 저장
                  </Button>

                  <Button
                    variant="primary"
                    onClick={onDownload}
                    className="btn_green"
                    disabled={!rowData || !rowData.length}
                  >
                    <img src={`${img_src}${icon_circle_arrow_down}`} />
                    다운로드
                  </Button>
                  {rowData && rowData.length > 0 && (
                    <span className="formName">
                      업로드한 매체 : <b>{rowData[0].forms_name}</b>
                    </span>
                  )}
                </div>
              </div>

              <ul className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
                <li
                  onClick={() => {
                    setRowData([...lastRowDatasRef.current]);
                  }}
                >
                  <p className="dt">총 주문</p>
                  <p className="dd">
                    {viewResult.unique_order_no_count && replace_1000(revert_1000(viewResult.unique_order_no_count))}
                    <span>건</span>
                  </p>
                </li>
                <li>
                  <p className="dt">택배 발송</p>
                  <p className="dd">
                    {viewResult.delivery_send_count && replace_1000(revert_1000(viewResult.delivery_send_count))}
                    <span>건</span>
                  </p>
                </li>
                <li
                  onClick={() => {
                    const lossRowGroups = _.map(
                      _.filter(rowData, (row) => {
                        return row.profit_loss < 0;
                      }),
                      'group.id'
                    );

                    setRowData(
                      _.filter(rowData, (row) => {
                        return _.includes(lossRowGroups, row.group.id);
                      })
                    );
                  }}
                >
                  <p className="dt">적자 주문</p>
                  <span className="dd txt_red">
                    {viewResult.loss_order_no_count && replace_1000(revert_1000(viewResult.loss_order_no_count))}
                    <span className="unit txt_red">건</span>
                  </span>
                </li>
                <li>
                  <p className="dt">상품 결제 금액</p>
                  <p className="dd">
                    {viewResult.sum_payment_price && replace_1000(revert_1000(viewResult.sum_payment_price))}
                    <span>원</span>
                  </p>
                </li>
                <li>
                  <p className="dt">받은 배송비</p>
                  <p className="dd">
                    {viewResult.sum_received_delivery_fee &&
                      replace_1000(revert_1000(viewResult.sum_received_delivery_fee))}
                    <span>원</span>
                  </p>
                </li>
                <li>
                  <p className="dt">보낸 배송비</p>
                  <p className="dd">
                    {viewResult.sum_delivery_fee && replace_1000(revert_1000(viewResult.sum_delivery_fee))}
                    <span>원</span>
                  </p>
                </li>
                <li className={viewResult.sum_profit_loss > 0 ? 'profit' : 'loss'}>
                  <p className="dt">손익 합계</p>
                  <p className="dd">
                    {viewResult.sum_profit_loss && replace_1000(revert_1000(viewResult.sum_profit_loss))}
                    <span>원</span>
                  </p>
                </li>
              </ul>

              <div style={containerStyle} className="tablebox">
                <Table className="thead">
                  <thead>
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
                    <th>총 손익</th>
                    <th>손익</th>
                    <th>결제일</th>
                    {/* <th>배송비묶음번호</th> */}
                    <th>주문번호</th>
                    <th>수취인명</th>
                    {/* <th>매체</th> */}
                    <th>판매상품명</th>
                    <th>옵션</th>
                    <th>수량</th>
                    <th>
                      총 결제금액
                      <br />
                      (정산예정금액)
                    </th>
                    <th>
                      받은 배송비
                      <br />
                      (배송비수수료)
                    </th>
                    <th>총 입고단가</th>
                    <th>배송비</th>
                    <th>포장비</th>
                    <th>수취인 연락처</th>
                    <th>수취인 주소</th>
                  </thead>
                  <tbody></tbody>
                </Table>
                <Table className="tbody">
                  <thead></thead>
                  <tbody>
                    {rowData &&
                      rowData.map((d, key) => (
                        <ProfitLossRow
                          onRowDoubleClick={onRowDoubleClick}
                          rowChecked={d.checked}
                          handleSingleCheck={handleSingleCheck}
                          key={key}
                          index={key}
                          d={d}
                          stockPriceDataRef={stockPriceDataRef}
                          setStockPriceModalState={setStockPriceModalState}
                        />
                      ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </>
        )}
      </Body>
      <Footer />
      <StockPriceModal
        modalState={stockPriceModalState}
        setModalState={setStockPriceModalState}
        goodsMatch={stockPriceDataRef.current}
      ></StockPriceModal>
      <MarginCalc_ConnectModal
        modalState={connectModalState}
        setModalState={setConnectModalState}
        rowData={rowData}
        unconnect_flag={true}
        deleteCallback={deleteCallback}
        saveCallback={saveCallback}
        selectData={connectModalSelectData}
      ></MarginCalc_ConnectModal>
      <MarginCalc_UnConnectModal
        modalState={unConnectModalState}
        setModalState={setUnConnectModalState}
        rowData={rowData}
        unconnect_flag={true}
        deleteCallback={deleteCallback}
        saveCallback={saveCallback}
        selectData={unConnectModalSelectData}
      ></MarginCalc_UnConnectModal>
    </>
  );
};
const calcProfitLoss = (profit_loss_row) => {
  let profit_loss = 0;
  profit_loss += profit_loss_row.aggregation;
  profit_loss += getRealityDeliveryFee(profit_loss_row);
  profit_loss += profit_loss_row.assembly_fee;
  profit_loss += profit_loss_row.installation_fee;

  const count = Number(profit_loss_row['30005']) ? Number(profit_loss_row['30005']) : 1;
  if (!Number(profit_loss_row['30005'])) return 0;

  profit_loss -= profit_loss_row.stock_price * count;
  profit_loss -= profit_loss_row.delivery_fee;
  profit_loss -= profit_loss_row.packing_fee;

  return Number(profit_loss.toFixed(0));
};

const getRealityDeliveryFee = (profit_loss_row) => {
  let pay_advance = profit_loss_row[30022];
  let delivery_fee = 0;
  const received_delivery_fee = profit_loss_row[30047] ? Number(profit_loss_row[30047]) : 0;
  const countryside_added_fee = profit_loss_row[30014] ? Number(profit_loss_row[30014]) : 0;
  const df_discount = profit_loss_row[30015] ? Number(profit_loss_row[30015]) : 0;

  // 배송비 선불인 경우
  // if (!pay_advance) {
  delivery_fee += received_delivery_fee;
  delivery_fee += countryside_added_fee;
  delivery_fee -= df_discount;
  delivery_fee *= 1 - parseFloat(profit_loss_row['30047_additional']) / 100;
  // }

  return delivery_fee;
};

const getAssemblyFee = (profit_loss_row) => {
  let assembly_fee = profit_loss_row[30032] ? Number(profit_loss_row[30032]) : 0;

  // 배송비 선불인 경우
  if (assembly_fee) {
    assembly_fee *= 1 - parseFloat(profit_loss_row['30032_additional']) / 100; // TODO 조립비 수수료.. 흠
  }

  return assembly_fee;
};

const getInstallationFee = (profit_loss_row) => {
  let installation_fee = profit_loss_row[30033] ? Number(profit_loss_row[30033]) : 0;

  // 배송비 선불인 경우
  if (installation_fee) {
    installation_fee *= 1 - parseFloat(profit_loss_row['30033_additional']) / 100; // TODO 설치비 수수료.. 흠
  }

  return installation_fee;
};

const getStockPrice = (profit_loss_row) => {
  return _.reduce(
    profit_loss_row.goods_match,
    function (sum, goods) {
      return sum + goods.stock_price * goods.match_count;
    },
    0
  );
};

const getAggregation = (profit_loss_row) => {
  let aggregation = profit_loss_row[30001] ? Number(profit_loss_row[30001]) : 0;

  //  정산예정금액이 있는 경우
  if (aggregation) {
    return aggregation; // 1. 정산예정금액 추가
  } else {
    // 없는 경우, 수수료 처리
    {
      aggregation = 0;
      aggregation += Number(profit_loss_row[30006]); // 1. 총 결제금액 더하기
      if (profit_loss_row[30019]) {
        aggregation -= Number(profit_loss_row[30019]); // 2. 기타할인1 빼기
      }
      if (profit_loss_row[30020]) {
        aggregation -= Number(profit_loss_row[30020]); // 3. 기타할인2 빼기
      }

      aggregation *= 1 - parseFloat(profit_loss_row.category_fee_rate) / 100;
    }

    return aggregation;
  }
};

const getDeliveryFee = (profit_loss_row) => {
  if (!profit_loss_row.goods_match) return 0;
  const maxGoodsMatch = _.maxBy(profit_loss_row.goods_match, 'delivery_fee');
  return maxGoodsMatch ? maxGoodsMatch.delivery_fee : 0;
};

const getPackingFee = (profit_loss_row) => {
  if (!profit_loss_row.goods_match || !profit_loss_row.goods_match.length) return 0;

  const maxGoodsMatch = _.maxBy(profit_loss_row.goods_match, 'packing_fee');
  return maxGoodsMatch.packing_fee;
};

const CalcSummary = (rowData) => {
  if (!rowData.length) {
    modal.alert('미연결 주문건을 삭제하면 값이 없습니다.');
    return {};
  }

  const unique_order_no = _.uniqBy(rowData, '30004');
  const unique_order_no_count = unique_order_no.length;

  let delivery_send;
  const changes = {};

  if (_.includes(Object.keys(rowData[0]), '30002')) {
    //배송비 묶음 번호가 있는 경우
    for (const row of rowData) {
      if (row.group.first) {
        const eqGroupDatas = _.filter(rowData, (item) => {
          return item.group.id === row.group.id;
        });

        // row.delivery_fee = _.max(eqGroupDatas, 'delivery_fee')['delivery_fee'];
        row.reality_delivery_fee = _.maxBy(eqGroupDatas, 'reality_delivery_fee')['reality_delivery_fee'];
      } else {
        row.reality_delivery_fee = 0;
        // row.delivery_fee = 0;
        // row['30047'] = 0;
        // row['30047_additional'] = 0;
      }

      row.profit_loss = calcProfitLoss(row);
    }

    for (const row of rowData) {
      if (row.group.first) {
        const eqGroupDatas = _.filter(rowData, (item) => {
          return item.group.id === row.group.id;
        });
        row.sum_profit_loss = _.sumBy(eqGroupDatas, 'profit_loss');
      }
    }
  }

  const delivery_send_count = delivery_send ? delivery_send.length : unique_order_no_count;
  const loss_order = _.filter(rowData, (row) => {
    return row.profit_loss < 0;
  });
  const loss_order_no_count = loss_order.length;
  const sum_payment_price = _.sumBy(rowData, '30006');
  const sum_received_delivery_fee = _.sumBy(rowData, '30047');
  let sum_profit_loss = _.sumBy(rowData, 'sum_profit_loss');
  const sum_delivery_fee = _.sumBy(rowData, 'delivery_fee');
  sum_profit_loss = _.floor(sum_profit_loss, 0);

  if (_.isNaN(sum_profit_loss)) {
    modal.alert('올바르지 않은 엑셀 데이터입니다. 확인 해주세요.');
    return null;
  }

  const summary = {
    forms_name: rowData[0].forms_name,
    unique_order_no_count: unique_order_no_count,
    delivery_send_count: delivery_send_count,
    loss_order_no_count: loss_order_no_count,
    sum_payment_price: sum_payment_price,
    sum_received_delivery_fee: sum_received_delivery_fee,
    sum_delivery_fee: sum_delivery_fee,
    sum_profit_loss: sum_profit_loss,
  };

  return summary;
};

const StockPriceModal = React.memo(({ modalState, setModalState, goodsMatch }) => {
  logger.render('StockPriceModal');

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal stockPriceModal">
      <Modal.Header>
        <Modal.Title>입고단가 확인</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table className="columncontrol tbody">
          <thead>
            <th>상품명</th>
            <th>입고단가</th>
            {/* <th>수량</th> */}
          </thead>
          <tbody>
            <>
              {goodsMatch &&
                goodsMatch.map((d, key) => (
                  <tr>
                    <td>{d.name}</td>
                    <td>{d.stock_price}</td>
                    {/* <td>{d.match_count}</td> */}
                  </tr>
                ))}
            </>
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          확인
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

function excelSerialDateToJSDate(excelSerialDate) {
  const dataType = typeof excelSerialDate;
  if (typeof dataType === 'string') {
    const tryNumber = Number(excelSerialDate);

    if (_.isNaN(tryNumber)) return excelSerialDate;
  }

  const daysBeforeUnixEpoch = 70 * 365 + 19;
  const hour = 60 * 60 * 1000;
  const date = new Date(Math.round((excelSerialDate - daysBeforeUnixEpoch) * 24 * hour) + 12 * hour);

  return time_format(date);
}

const ProfitLossRow = React.memo(
  ({ handleSingleCheck, rowChecked, d, stockPriceDataRef, setStockPriceModalState, onRowDoubleClick }) => {
    const [inputs, setInputs] = useState({
      stock_price: d.stock_price == '' || !d['30005'] ? '0' : replace_1000(d.stock_price),
      delivery_fee: d.delivery_fee == '' ? '0' : replace_1000(d.delivery_fee),
      packing_fee: d.packing_fee == '' ? '0' : replace_1000(d.packing_fee),
    });
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      setChecked(rowChecked);
    }, [rowChecked]);

    const checkedItemHandler = (e) => {
      handleSingleCheck(d.idx, !checked);
      setChecked(!checked);
    };

    const onChange = (e) => {
      const { value, name } = e.target; // 우선 e.target 에서 name 과 value 를 추출

      setInputs({
        ...inputs, // 기존의 input 객체를 복사한 뒤
        [name]: replace_1000(revert_1000(value)), // name 키를 가진 값을 value 로 설정
      });

      d[name] = revert_1000(value);
    };

    return (
      <tr>
        <td>
          <Checkbox checked={checked} checkedItemHandler={checkedItemHandler}></Checkbox>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
          hidden={!d.group.first}
          rowSpan={d.group.first ? d.group.size : 1}
        >
          <SumPLRenderer data={d}></SumPLRenderer>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <PLRenderer data={d}></PLRenderer>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {excelSerialDateToJSDate(d['30003'])}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {d['30004']}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {d['30048']}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {d['forms_name']}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <OptionCellRenderer data={d}></OptionCellRenderer>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {Number(d['30005'])}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <_30006Renderer data={d}></_30006Renderer>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <_30047Renderer data={d}></_30047Renderer>
        </td>
        <td
          onDoubleClick={() => {
            stockPriceDataRef.current = d.goods_match;
            setStockPriceModalState(true);
          }}
        >
          <input name="stock_price" value={inputs.stock_price} onChange={onChange}></input>
          <span>원</span>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <input name="delivery_fee" value={inputs.delivery_fee} onChange={onChange}></input>
          <span>원</span>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          <input name="packing_fee" value={inputs.packing_fee} onChange={onChange}></input>
          <span>원</span>
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {d['30049']}
        </td>
        <td
          onDoubleClick={(e) => {
            onRowDoubleClick(e, d);
          }}
        >
          {d['30050']}
        </td>
      </tr>
    );
  }
);

export default React.memo(MarginCalc);
