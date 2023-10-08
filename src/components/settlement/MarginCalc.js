import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import com, { img_src, modal, navigate } from 'util/com';
import request from 'util/request';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import MarginCalc_ConnectModal from 'components/settlement/MarginCalc_ConnectModal';
import MarginCalc_UnConnectModal from 'components/settlement/MarginCalc_UnConnectModal';
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

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import ColumnControlModal from 'components/common/AgGrid/ColumnControlModal';
import CommonDateModal from 'components/common/CommonDateModal';

const PLRenderer = (params) => {
  if (params.data && params.data.connect_flag == false) {
    return <>미연결</>;
  }

  return (
    <>
      {params.value == '-' || isNaN(params.value) || (params.value != 0 && !params.value) || params.value === '' ? (
        <>
          <span>
            계산 전
            <br />
            {'-'}
          </span>
        </>
      ) : (
        <>
          {params.value > 0 ? (
            <>
              <span className="profit">
                이익
                <br />
                {params.value}
              </span>
            </>
          ) : (
            <>
              <span className="loss">
                손해
                <br />
                {params.value}
              </span>
            </>
          )}
        </>
      )}
    </>
  );
};

const _30006Renderer = (params) => {
  return (
    <>
      {params.data[30006] && `${replace_1000(revert_1000(params.data[30006]))}`}

      {params.data[30001] && (
        <>
          <span class="subtxt">({replace_1000(revert_1000(params.data[30001]))})</span>
        </>
      )}
    </>
  );
};

const _30047Renderer = (params) => {
  return (
    <>
      {params.data[30047] ? `${replace_1000(revert_1000(params.data[30047]))}` : `0`}

      {params.data.delivery_fee && params.data['30047_additional'] && (
        <>
          <span class="subtxt">
            (
            {replace_1000(
              revert_1000(((params.data[30047] * Number(params.data['30047_additional'])) / 100).toFixed(0))
            )}
            )
          </span>
        </>
      )}
    </>
  );
};

const optionCellRenderer = (props) => {
  return (
    <>
      {props.data[30008]}
      {props.data[30011] && props.data[30011]}
      {props.data[30012] && props.data[30012]}
    </>
  );
};

function rowSpan(params) {
  if (params.data && params.data.group.first) {
    return params.data.group.size;
  }
  return 0;
}

const ROUTE_COLUMN_BASE = [
  {
    field: '',
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned checkcell',
    checkboxSelection: true,
    maxWidth: 36,
    horizontal: 'Center',
  },
  { field: 'idx', hide: true },
  {
    field: 'profit_loss',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned uneditable',
    editable: false,
    headerName: '손익',
    wrapText: true,
    autoHeight: true,
    filter: false,
    unSortIcon: true,
    width: 140,
    cellRenderer: PLRenderer,
  },
  {
    field: '30003',
    sortable: true,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'lock-pinned uneditable',
    editable: false,
    headerName: '결제일',
    filter: false,
    unSortIcon: true,
    width: 170,
    valueFormatter: (params) => {
      return excelSerialDateToJSDate(params.value);
    },
  },
  {
    field: '30002',
    sortable: true,
    unSortIcon: true,
    headerName: '배송비묶음번호',
    maxWidth: 150,
    cellClass: 'uneditable',
    hide: true,
  },
  {
    field: '30004',
    sortable: true,
    unSortIcon: true,
    headerName: '주문번호',
    maxWidth: 150,
    cellClass: 'uneditable',
  },
  {
    field: '30048',
    sortable: false,
    unSortIcon: true,
    headerName: '수취인명',
    width: 130,
    editable: true,
    cellClass: 'ag-cell-editable',
  },
  {
    field: 'forms_name',
    sortable: false,
    unSortIcon: true,
    headerName: '매체',
    width: 150,
    cellClass: 'uneditable',
  },
  {
    field: '30007',
    sortable: false,
    unSortIcon: true,
    headerName: '판매상품명',
    minWidth: 400,
    wrapText: true,
    autoHeight: true,
    vertical: 'Center',
    cellClass: 'uneditable',
  },
  {
    field: '30008',
    sortable: false,
    unSortIcon: true,
    headerName: '옵션',
    minWidth: 300,
    wrapText: true,
    autoHeight: true,
    vertical: 'Center',
    cellRenderer: optionCellRenderer,
    cellClass: 'uneditable',
  },
  {
    field: '30005',
    sortable: false,
    unSortIcon: true,
    valueParser: (params) => Number(params.newValue),
    headerName: '수량',
    maxWidth: 80,
    autoHeight: true,
    cellClass: 'uneditable',
  },
  {
    field: '30006',
    sortable: false,
    unSortIcon: true,
    headerName: '총 결제금액\n(정산예정금액)',
    width: 130,
    autoHeight: true,
    cellClass: 'uneditable',
    cellRenderer: _30006Renderer,
  },
  {
    field: '30047',
    sortable: false,
    unSortIcon: true,
    headerName: '받은 배송비\n(배송비 수수료)',
    width: 130,
    editable: true,
    cellClass: 'ag-cell-editable',
    cellRenderer: _30047Renderer,
  },
  {
    field: 'stock_price',
    sortable: false,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '총 입고단가',
    width: 120,
    editable: true,
    cellClass: 'ag-cell-editable',
  },
  {
    field: 'delivery_fee',
    sortable: false,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '배송비',
    width: 120,
    editable: true,
    cellClass: 'ag-cell-editable',
  },
  {
    field: 'packing_fee',
    sortable: false,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '') return 0;
      return replace_1000(params.value);
    },
    headerName: '포장비',
    width: 120,
    editable: true,
    cellClass: 'ag-cell-editable',
  },
  // {
  //   field: '30050',
  //   sortable: false,
  //   unSortIcon: true,
  //   headerName: '수취인주소',
  //   width: 130,
  //   editable: true,
  //   cellClass: 'ag-cell-editable',
  // },
  {
    field: '30049',
    sortable: false,
    unSortIcon: true,
    headerName: '수취인연락처',
    width: 130,
    editable: true,
    cellClass: 'ag-cell-editable',
  },
];

// const getRowHeight = useCallback((params) => {
//   return params.data.rowHeight;
// }, []);

const rowHeight = 44;

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
  const [columnControlModalState, setColumnControlModalState] = useState(false);
  const [connectModalSelectData, setConnectModalSelectData] = useState({});
  const [unConnectModalSelectData, setUnConnectModalSelectData] = useState({});
  const [sliderState, setSliderState] = useState(false);
  const [dateModalState, setDateModalState] = useState(false);

  const dateRef = useRef(null);
  const stockPriceDataRef = useRef(null);
  //ag-grid
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      minWidth: 80,
      // wrapHeaderText: true,
      autoHeaderHeight: true,
    };
  }, []);
  const [columnDefs, setColumnDefs] = useState([]);

  const SetColumnDefsFunc = (now_platform) => {
    if (!now_platform) return; // TODO Error
    if (!now_platform.titles) return; // TODO Error

    const view_titles = _.filter(now_platform.titles, { view: 1 });
    const not_yet_added_fields = _.filter(view_titles, (view_title) => {
      return !_.find(ROUTE_COLUMN_BASE, (route_title) => {
        return view_title.sella_code == Number(route_title.field);
      });
    });

    const sella_forms = Recoils.getState('SELLA:SELLAFORMS');

    const toAddFields = [];
    // for (const field_data of not_yet_added_fields) {
    //   const findObj = _.find(sella_forms, { code: field_data.sella_code });
    //   if (findObj.type == 1) {
    //     toAddFields.push(GetColonField(field_data.title, field_data.sella_code));
    //   } else {
    //     toAddFields.push(GetField(field_data.title, field_data.sella_code));
    //   }
    // }

    setColumnDefs([...ROUTE_COLUMN_BASE, ...toAddFields]);
  };

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
    if (gridRef.current) {
      gridRef.current.api.setColumnDefs(columnDefs);
    }
  }, [columnDefs]);

  useEffect(() => {
    setRowData([]);
    setViewResult({});
    SetColumnDefsFunc(platforms[platformType]);
  }, [platforms, platformType]);

  useEffect(() => {
    if (!rowData || !rowData.length) return;

    if (rowData && rowData.length > 0) {
      com.storage.setItem('exist_margin_calc_data', '1');
    }

    if (unConnectModalState) return;

    const unconnect_rows = _.filter(rowData, (data) => {
      return !data.connect_flag;
    });

    if (unconnect_rows.length != 0) {
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
              setUnConnectModalSelectData(unconnect_rows[0]);
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
  }, [rowData]);

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

  const onCellDoubleClick = (param) => {
    if (param.column.colId === 'stock_price') {
      stockPriceDataRef.current = param.data.goods_match;
      setStockPriceModalState(true);
    } else {
      if (param.data) {
        if (param.data.connect_flag == true) {
          setConnectModalSelectData(param.data);
          setConnectModalState(true);
        } else {
          setUnConnectModalSelectData(param.data);
          setUnConnectModalState(true);
        }
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
            callback: () => {
              onDeleteUnconnectRow();
              const connect_rows = _.filter(rowData, (data) => {
                return data.connect_flag;
              });
              const summary = CalcSummary(connect_rows);

              setViewResult(summary);
              setRowData(_.cloneDeep(connect_rows));
            },
          },
        ]
      );
    } else {
      const summary = CalcSummary(rowData);

      setViewResult(summary);
      setRowData(_.cloneDeep(rowData));
    }
  };

  const onDeleteUnconnectRow = () => {
    const connect_rows = _.filter(rowData, (data) => {
      return data.connect_flag;
    });

    setRowData(connect_rows);
  };

  const onDownload = async () => {
    if (!rowData) return;
    if (!rowData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const columns = [];
    for (const column of columnDefs) {
      if (column.field == '') continue;

      const toAddedColumn = {};
      toAddedColumn.header = column.headerName;
      toAddedColumn.key = column.field;
      toAddedColumn.width = 20;

      columns.push(toAddedColumn);
    }
    worksheet.columns = columns;

    worksheet.addRows([...rowData]);

    const mimeType = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    const time = moment().format('YYYYMMDDHHmmss');
    saveAs(blob, `주문서_${time}.xlsx`);
  };

  const onDelete = (e) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const delete_arr = _.map(selectedRows, 'idx');
    setRowData(
      _.filter(rowData, (row) => {
        return !_.includes(delete_arr, row.idx);
      })
    );
  };

  const onSaveTodaySummary = () => {
    if (!rowData || !rowData.length) return;

    const unconnect_rows = _.filter(rowData, (data) => {
      return !data.connect_flag;
    });

    if (unconnect_rows.length != 0) {
      modal.confirm(
        '저장할 수 없습니다.',
        [{ strong: '미연결 주문건이 있어서 저장할 수 없습니다.', normal: '' }],
        [
          {
            name: '매칭하러 가기',
            callback: () => {
              setUnConnectModalState(true);
            },
          },
          {
            name: '미연결 주문건 삭제 후 저장',
            callback: () => {
              onDeleteUnconnectRow();
              request
                .post(`user/today_summary/save`, { save_data: { ...viewResult, date: dateRef.current } })
                .then((ret) => {
                  if (!ret.err) {
                    const { data } = ret.data;
                    logger.info(data);

                    dateRef.current = null;
                    setRowData(() => data);
                  }
                });
            },
          },
        ]
      );
    } else {
      request.post(`user/today_summary/save`, { save_data: viewResult, date: dateRef.current }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          dateRef.current = null;
          navigate('settlement/today_summary');
        }
      });
    }
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
      setRowData(
        _.filter(rowData, (item) => {
          return !(item.forms_product_name == d.forms_product_name && item.forms_option_name == d.forms_option_name);
        })
      );
    }
  };

  const saveCallback = (save_datas, result_forms_matchs, connect_flag) => {
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

  const saveViewColumnsCallback = (nowPlatform) => {
    SetColumnDefsFunc(nowPlatform);
  };

  const getRowStyle = (params) => {
    //색은 바꾸자..
    const colors = ['#FFCCFF', '#FFFFCC'];
    if (!params.node.data.connect_flag) {
      return { background: '#FFEAEA' };
    } else {
      return { background: colors[params.node.data.group.id % 2] };
    }
  };

  const onChangeDate = (date) => {
    dateRef.current = date;
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
                    autoplaySpeed={2000}
                    dots={false}
                    slidesToShow={1}
                    slidesToScroll={1}
                    arrow={false}
                  >
                    {announcement &&
                      announcement.map((data, key) => (
                        <h2>
                          <span>{data.announcement_category}</span>{' '}
                          <span
                            onClick={() => {
                              com.storage.setItem('nav_announcement', data.idx);
                              navigate('/cscenter/announcement');
                            }}
                          >
                            {data.title}
                          </span>{' '}
                          <span>{time_format_none_time(data.reg_date)}</span>
                        </h2>
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

                  <Button
                    variant="primary"
                    onClick={() => {
                      setDateModalState(true);
                    }}
                  >
                    주문서 날짜 변경
                  </Button>
                  <Button onClick={onSaveTodaySummary} disabled={_.isEmpty(viewResult)}>
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

                  {/* <Button
                    className="btn_set"
                    onClick={() => {
                      setColumnControlModalState(true);
                    }}
                  >
                    <img src={`${img_src}${icon_set}`} />
                  </Button> */}
                </div>
              </div>

              <ul className={!_.isEmpty(viewResult) ? 'viewbox' : 'viewbox off'}>
                <li>
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
                <li>
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
                <li className={viewResult.sum_profit_loss > 0 ? 'profit' : 'loss'}>
                  <p className="dt">손익 합계</p>
                  <p className="dd">
                    {viewResult.sum_profit_loss && replace_1000(revert_1000(viewResult.sum_profit_loss))}
                    <span>원</span>
                  </p>
                </li>
              </ul>

              <div style={containerStyle} className="tablebox">
                <div style={gridStyle} className="ag-theme-alpine test">
                  <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    alwaysShowHorizontalScroll={true}
                    alwaysShowVerticalScroll={true}
                    defaultColDef={defaultColDef}
                    rowSelection={'multiple'}
                    // onRowDoubleClicked={onClick}
                    onCellDoubleClicked={onCellDoubleClick}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={'데이터가 없습니다.'}
                    suppressRowTransform={true}
                    rowHeight={rowHeight}
                    singleClickEdit={true}
                    stopEditingWhenCellsLoseFocus={true}
                    // getRowHeight={getRowHeight}
                  ></AgGridReact>
                </div>
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
      <ColumnControlModal
        modalState={columnControlModalState}
        setModalState={setColumnControlModalState}
        platform={platforms[platformType]}
        callback={saveViewColumnsCallback}
      ></ColumnControlModal>
      <CommonDateModal
        modalState={dateModalState}
        setModalState={setDateModalState}
        onChangeDate={onChangeDate}
      ></CommonDateModal>
    </>
  );
};
const calcProfitLoss = (profit_loss_row) => {
  let profit_loss = 0;
  profit_loss += profit_loss_row.aggregation;
  profit_loss += profit_loss_row.reality_delivery_fee;
  profit_loss += profit_loss_row.assembly_fee;
  profit_loss += profit_loss_row.installation_fee;

  const count = Number(profit_loss_row['30005']) ? Number(profit_loss_row['30005']) : 1;
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
  if (!pay_advance) {
    delivery_fee += received_delivery_fee;
    delivery_fee += countryside_added_fee;
    delivery_fee -= df_discount;
    delivery_fee *= 1 - parseFloat(profit_loss_row['30047_additional']) / 100;
  }

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
  // return _.sumBy(profit_loss_row.goods_match, 'delivery_fee');

  if (!profit_loss_row.goods_match) return 0;
  const maxGoodsMatch = _.maxBy(profit_loss_row.goods_match, 'delivery_fee');
  return maxGoodsMatch ? maxGoodsMatch.delivery_fee : 0;
};

const getPackingFee = (profit_loss_row) => {
  // return _.sumBy(profit_loss_row.goods_match, 'packing_fee');

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

        row.delivery_fee = _.max(eqGroupDatas, 'delivery_fee')['delivery_fee'];
        row.reality_delivery_fee = _.maxBy(eqGroupDatas, 'reality_delivery_fee')['reality_delivery_fee'];
        row['30047'] = _.maxBy(eqGroupDatas, '30047')['30047'];
        row['30047_additional'] = _.maxBy(eqGroupDatas, '30047_additional')['30047_additional'];
      } else {
        row.reality_delivery_fee = 0;
        row.delivery_fee = 0;
        row['30047'] = 0;
        row['30047_additional'] = 0;
      }

      row.profit_loss = calcProfitLoss(row);
    }
  }

  const delivery_send_count = delivery_send ? delivery_send.length : unique_order_no_count;
  const loss_order = _.filter(rowData, (row) => {
    return row.profit_loss < 0;
  });
  const loss_order_no_count = loss_order.length;
  const sum_payment_price = _.sumBy(rowData, '30006');
  const sum_received_delivery_fee = _.sumBy(rowData, '30047');
  let sum_profit_loss = _.sumBy(rowData, 'profit_loss');
  sum_profit_loss = _.floor(sum_profit_loss, 0);

  const summary = {
    forms_name: rowData[0].forms_name,
    unique_order_no_count: unique_order_no_count,
    delivery_send_count: delivery_send_count,
    loss_order_no_count: loss_order_no_count,
    sum_payment_price: sum_payment_price,
    sum_received_delivery_fee: sum_received_delivery_fee,
    sum_profit_loss: sum_profit_loss,
  };

  return summary;
};

const GetField = (title, code) => {
  const ret = {
    field: `${code}`,
    sortable: true,
    unSortIcon: true,
    headerName: `${title}`,
    width: 120,
    editable: true,
    cellClass: 'ag-cell-editable',
  };

  return ret;
};

const GetColonField = (title, code) => {
  const ret = {
    field: `${code}`,
    sortable: true,
    unSortIcon: true,
    valueParser: (params) => {
      return Number.isNaN(Number(params.newValue)) ? params.oldValue : Number(params.newValue);
    },
    valueFormatter: (params) => {
      if (params.value == '' || !params.value) return 0;
      return replace_1000(params.value);
    },
    headerName: `${title}`,
    width: 120,
    editable: true,
    cellClass: 'ag-cell-editable',
  };

  return ret;
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
            <th>수량</th>
          </thead>
          <tbody>
            <>
              {goodsMatch &&
                goodsMatch.map((d, key) => (
                  <tr>
                    <td>{d.name}</td>
                    <td>{d.stock_price}</td>
                    <td>{d.match_count}</td>
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

export default React.memo(MarginCalc);
