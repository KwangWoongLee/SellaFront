import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import { img_src, modal, logger, page_reload, navigate, revert_1000, replace_1000 } from 'util/com';
import request from 'util/request';
import _ from 'lodash';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
//

import 'styles/Margin.scss';

import icon_check from 'images/icon_check.svg';

const Margin_NoLogin = () => {
  //logger.debug('Margin_NoLogin');

  const [platformData, setPlatformData] = useState([]);
  const [platformType, setplatformType] = useState(-1);

  //inputs
  const nameRef = useRef(null);
  const sellPriceRef = useRef(null);
  const sellDeliveryFeeRef = useRef(null);
  const stockPriceRef = useRef(null);
  const savedDPFeeRef = useRef(null);
  const platformFeeRateRef = useRef(null);
  const platformDeliverFeeRateRef = useRef(null);

  const [resultData, setResultData] = useState({
    sell_price: 0,
    settlement_price: 0,
    margin: 0,
    margin_rate: 0,
  });
  const [sumMinus, setSumMinus] = useState(0);
  const [sumPlus, setSumPlus] = useState(0);
  const [lowestPrice, setLowestPrice] = useState('');

  useEffect(() => {
    request.post(`base/info/sella_platform`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        setPlatformData(() => data.platform);
        setplatformType(0);
      }
    });
  }, []);

  useEffect(() => {
    if (!platformData || !platformData.length) return;

    let platformFeeRate = Number(platformData[platformType].fee_rate);
    platformFeeRate = platformFeeRate.toFixed(2);
    platformFeeRateRef.current.value = platformFeeRate;

    let platformDeliverFeeRate = Number(platformData[platformType].delivery_fee_rate);
    platformDeliverFeeRate = platformDeliverFeeRate.toFixed(2);
    platformDeliverFeeRateRef.current.value = platformDeliverFeeRate;
  }, [platformType]);

  const onChange = (key, e) => {
    setplatformType(key);
  };

  const onChangeInput = (e, ref) => {
    // if (e.target.value.match('^[a-zA-Z ]*$') != null) {
    //   ref.current.value = e.target.value;
    // }
    ref.current.value = replace_1000(revert_1000(e.target.value));
  };

  const onClickCalc = (e) => {
    let sellPrice = sellPriceRef.current.value;
    let sellDeliveryFee = sellDeliveryFeeRef.current.value;
    let stockPrice = stockPriceRef.current.value;
    let savedDPFee = savedDPFeeRef.current.value;

    let platformFeeRate = platformFeeRateRef.current.value;
    let platformDeliverFeeRate = platformDeliverFeeRateRef.current.value;

    if (sellPrice === '') {
      modal.alert('판매가격을 입력해주세요.');
      return;
    }
    if (sellDeliveryFee === '') {
      modal.alert('받은 배송비를 입력해주세요.');
      return;
    }
    if (stockPrice === '') {
      modal.alert('매입가를 입력해주세요.');
      return;
    }
    if (savedDPFee === '') {
      modal.alert('택배비·포장비 를 입력해주세요.');
      return;
    }

    sellPrice = revert_1000(sellPrice);
    if (sellPrice === 0) {
      modal.alert('판매가격은 0원 일 수 없습니다.');
      return;
    }

    sellDeliveryFee = revert_1000(sellDeliveryFee);
    stockPrice = revert_1000(stockPrice);
    savedDPFee = revert_1000(savedDPFee);

    platformFeeRate = Number(platformFeeRate);
    if (platformFeeRate < 0 || platformFeeRate >= 100) {
      modal.alert('매체 수수료율을 0~100% 사이로 입력해주세요.');
      return;
    }
    platformFeeRate = platformFeeRate / 100;
    platformFeeRate = Number(platformFeeRate.toFixed(5));

    platformDeliverFeeRate = Number(platformDeliverFeeRate);
    if (platformDeliverFeeRate < 0 || platformDeliverFeeRate >= 100) {
      modal.alert('배송비 수수료율을 0~100% 사이로 입력해주세요.');
      return;
    }

    platformDeliverFeeRate = platformDeliverFeeRate / 100;
    platformDeliverFeeRate = Number(platformDeliverFeeRate.toFixed(5));

    let platformFee = sellPrice * platformFeeRate;
    let platformDeliveryFee = sellDeliveryFee * platformDeliverFeeRate;

    const sum_minus = stockPrice + savedDPFee; // 비용합계
    setSumMinus(sum_minus);

    const sum_plus = sellPrice + sellDeliveryFee; // 수익합계
    setSumPlus(sum_plus);

    const settlement_price = (sellPrice - platformFee + sellDeliveryFee - platformDeliveryFee).toFixed(0);
    let margin = settlement_price - sum_minus;
    margin = Number(Math.round(margin));
    let marginRate = (margin / sellPrice) * 100;
    marginRate = Number(marginRate.toFixed(1));

    const result = {
      sell_price: sellPrice,
      settlement_price: settlement_price,
      margin: margin,
      margin_rate: marginRate,
    };

    setResultData({ ...result });
  };

  const onReset = () => {
    sellPriceRef.current.value = '';
    sellDeliveryFeeRef.current.value = '';
    stockPriceRef.current.value = '';
    savedDPFeeRef.current.value = '';
    setSumMinus(0);
    setSumPlus(0);
    setResultData({
      sell_price: 0,
      settlement_price: 0,
      margin: 0,
      margin_rate: 0,
    });
    setplatformType(0);
  };

  return (
    <>
      <Head_NoLogin />
      <Body title={`마진 계산기`} myClass={'margin nologin'}>
        <div className="section section1">
          <div className="tablebox1">
            <table>
              <colgroup>
                <col width="50px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th>정산금액</th>
                  <td>
                    {replace_1000(revert_1000(resultData.settlement_price))}
                    <span> 원</span>
                  </td>
                </tr>

                <tr>
                  <th>판매이익</th>
                  <td className={resultData.margin >= 0 ? 'txt_green' : 'txt_red'}>
                    <span>{resultData.margin >= 0 ? '이익' : '손해'} </span>
                    {resultData.margin > 0 && '+'}
                    {replace_1000(revert_1000(resultData.margin))}
                    <span> 원</span>
                  </td>
                </tr>

                <tr>
                  <th>마진율</th>
                  <td className={resultData.margin_rate >= 0 ? 'txt_green' : 'txt_red'}>
                    {resultData.margin_rate}
                    <span> %</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="tablebox2">
            <table>
              <tbody>
                <tr>
                  <td>
                    <span className="txt_green">판매가격</span>
                    <input
                      type="text"
                      ref={sellPriceRef}
                      onChange={(e) => {
                        onChangeInput(e, sellPriceRef);
                      }}
                    ></input>
                    <span>원</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <span className="txt_green">받은 배송비</span>
                    <input
                      type="text"
                      ref={sellDeliveryFeeRef}
                      onChange={(e) => {
                        onChangeInput(e, sellDeliveryFeeRef);
                      }}
                    ></input>
                    <span>원</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <span className="txt_red">매입가</span>
                    <input
                      type="text"
                      ref={stockPriceRef}
                      onChange={(e) => {
                        onChangeInput(e, stockPriceRef);
                      }}
                    ></input>
                    <span>원</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <span className="txt_red inner">
                      보낸 배송비<i>(택배비·포장비)</i>
                    </span>
                    <input
                      type="text"
                      ref={savedDPFeeRef}
                      onChange={(e) => {
                        onChangeInput(e, savedDPFeeRef);
                      }}
                    ></input>
                    <span>원</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <span className="txt_red">수수료</span>
                    <DropdownButton
                      variant=""
                      title={platformType !== -1 && platformData.length ? platformData[platformType].name : ''}
                      className="nounit"
                    >
                      {platformData &&
                        platformData.map((item, key) => (
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
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="txt_small">매체 수수료</span>
                    <input type="number" ref={platformFeeRateRef}></input>
                    <span>%</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="txt_small">배송비 수수료</span>
                    <input type="number" ref={platformDeliverFeeRateRef}></input>
                    <span>%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button variant="primary" className="btn_blue btn_calc" onClick={onClickCalc}>
            계산하기
          </Button>
          <div className="btnbox">
            <Button variant="primary" onClick={onReset}>
              초기화
            </Button>
          </div>
        </div>
        <div className="section section2">
          <h5>
            하루 최대 5회 가능
            <span>
              <b>0</b>/ 5
            </span>
          </h5>
          <h3>마진 계산기 무료버전</h3>
          <h4>더 강력한 기능을 횟수 제한 없이 사용해 보세요.</h4>
          <iframe
            width="653"
            height="367"
            src="https://www.youtube.com/embed/BjYNGW4NaA4?autoplay=1&mute=1&loop=1&controls=0showinfo=0&Modembranding=1&rel=0"
            title="마진계산기 사용방법"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            className="videobox"
          ></iframe>

          <div class="innerbox">
            {/* <dl>
              <dt>
                지금 가입하면 <b>2주 무료사용</b>
                <span>[ 지금 가입하면 2주 무료사용 ]</span>
              </dt>
              <dd>
                1개월 이용시
                <span>
                  <i>▶</i>19.900원
                </span>
              </dd>
              <dd>
                1년 이용 시
                <span>
                  <b>238,800원</b>
                  <i>▶</i>214,900원
                </span>
              </dd>
            </dl> */}
            <ul>
              <li>
                <img src={`${img_src}${icon_check}`} />
                <b>주문 전 손익계산</b>으로 오출고 방지와 손익정산까지 한번에
              </li>
              <li>
                <img src={`${img_src}${icon_check}`} />
                저장한 데이터를 통해 <b>일별/월별 정산 결과 모아보기</b>
              </li>
              <li>
                <img src={`${img_src}${icon_check}`} />
                수수료 자동 입력, 배송비/포장비 등 <b>한번 입력하면 끝</b>
              </li>
              <li>
                <img src={`${img_src}${icon_check}`} />
                제한없는 <b>마진 계산 기능</b>과 계산 데이터 저장기능
              </li>
              <li>
                <img src={`${img_src}${icon_check}`} />
                상품 업로드 전 <b>최저가 계산기</b>로 손해방지 필수
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                navigate('/login');
              }}
              class="btn-primary btn btn-primary"
            >
              사용 신청하기
            </button>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Margin_NoLogin);
