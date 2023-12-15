import React, { useEffect, useState, useRef } from 'react';
import { Button, InputGroup, Form, Nav, Modal } from 'react-bootstrap';
import Recoils from 'recoils';
import { is_authed } from 'util/com';
import com, { logger, navigate, img_src, modal } from 'util/com';
import Head from 'components/template/Head';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import _ from 'lodash';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import 'styles/Home.scss';

import btn_start from 'images/btn_start.png';
import banner_01 from 'images/banner_01.png';
import banner_02 from 'images/banner_02.png';
import banner_03 from 'images/banner_03.png';
import banner_04 from 'images/banner_04.png';
import banner_05 from 'images/banner_05.png';
import banner_06 from 'images/banner_06.png';
import banner_07 from 'images/banner_07.png';
import banner_01_m from 'images/banner_01_m.png';
import banner_02_m from 'images/banner_02_m.png';
import banner_05_m from 'images/banner_05_m.png';
import main01_01 from 'images/main01_01.png';
import main01_02 from 'images/main01_02.png';
import main01_03 from 'images/main01_03.png';
import main01_04 from 'images/main01_04.png';
import btn_kakaotalk from 'images/btn_kakaotalk.png';
import icon_arrow_right2 from 'images/icon_arrow_right2.svg';
import img_stamp14days from 'images/img_stamp14days.svg';
import img_stamp10sale from 'images/img_stamp10sale.svg';
import img_salearrow from 'images/img_salearrow.svg';

const Home = () => {
  const [sliderState, setSliderState] = useState(false);
  const [scrollElemId, setScrollElemId] = useState('');
  const [currentLiTag, setCurrentLiTag] = useState(0);

  useEffect(() => {
    const element = document.getElementById(scrollElemId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollElemId]);

  useEffect(() => {
    const header_nologin_select = com.storage.getItem('header_nologin_select');
    if (header_nologin_select !== '') {
      setScrollElemId(`main0${Number(header_nologin_select)}`);
      com.storage.setItem('header_nologin_select', '');
    }
  }, []);

  return (
    <>
      {is_authed() ? <Head /> : <Head_NoLogin setScrollElemId={setScrollElemId} />}
      <Body title={`서비스 소개`} myClass={'home'}>
        <Slider
          className="bannerslide pc"
          modalState={sliderState}
          setModalState={setSliderState}
          autoplay={true}
          autoplaySpeed={6000}
          slidesToShow={1}
          slidesToScroll={1}
        >
          <div className="bannerwrap">
            <dl className="left">
              <dd>
                오늘 들어온 주문.
                <br />
                이익이 얼마일까? 손해는 아닐까?
                <br />
                걱정이신가요?
              </dd>
              <dt>1분이면 정산 걱정 끝!</dt>
              <dd className="btn_start">
                <Button
                  onClick={() => {
                    is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                  }}
                >
                  <img src={`${img_src}${btn_start}`} />
                </Button>
              </dd>
            </dl>
            <img
              onClick={() => {
                is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
              }}
              src={`${img_src}${banner_01}`}
            />
          </div>
          <div className="bannerwrap">
            <dl className="right">
              <dd>
                네이버, 쿠팡 주문서 양식 우선 지원
                <br />
                개별 맞춤 양식까지 설정 가능!
              </dd>
              <dt>
                셀라 정산 서비스
                <br />
                베타 오픈
              </dt>
              <dd className="btn_start">
                <Button>
                  <img
                    onClick={() => {
                      is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                    }}
                    src={`${img_src}${btn_start}`}
                  />
                </Button>
              </dd>
            </dl>
            <img
              onClick={() => {
                is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
              }}
              src={`${img_src}${banner_02}`}
            />
          </div>
          <div className="bannerwrap">
            <dl className="left">
              <dd>
                실제 손익결과 데이터를
                <br />
                월별/일별로 합계까지 편하게!
              </dd>
              <dt>손익캘린더 모아보기</dt>
              <dd className="btn_start">
                <Button>
                  <img
                    onClick={() => {
                      is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                    }}
                    src={`${img_src}${btn_start}`}
                  />
                </Button>
              </dd>
            </dl>
            <img
              onClick={() => {
                console.log(1);
              }}
              src={`${img_src}${banner_03}`}
            />
          </div>
          <div className="bannerwrap">
            <dl className="right">
              <dd>
                엑셀 업로드 한번으로
                <br />
                손익 결과를 확인하세요
              </dd>
              <dt>손익 계산 무료 체험</dt>
              <dd className="btn_start">
                <Button
                  onClick={() => {
                    is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                  }}
                >
                  <img src={`${img_src}${btn_start}`} />
                </Button>
              </dd>
            </dl>
            <img src={`${img_src}${banner_04}`} />
          </div>
          <div className="bannerwrap">
            <dl className="right txt_fff">
              <dd>
                잘못 출고되면 골치아프죠.
                <br />
                국내 최초 손해 주문건 미리 체크 가능!
              </dd>
              <dt>1분이면 오출고 걱정 끝!</dt>
              <dd className="btn_start">
                <Button
                  onClick={() => {
                    is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                  }}
                >
                  <img src={`${img_src}${btn_start}`} />
                </Button>
              </dd>
            </dl>
            <img src={`${img_src}${banner_05}`} />
          </div>
          <div className="bannerwrap">
            <dl className="left">
              <dd>
                내가 팔고 있는 상품
                <br />
                한번만 입력하면 모든 정산이 한번에!
              </dd>
              <dt>기준 상품 입력하기</dt>
              <dd className="btn_start">
                <Button
                  onClick={() => {
                    is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                  }}
                >
                  <img src={`${img_src}${btn_start}`} />
                </Button>
              </dd>
            </dl>
            <img src={`${img_src}${banner_06}`} />
          </div>
          <div className="bannerwrap">
            <dl className="left">
              <dd>
                가격 수정 전 필수!
                <br />
                현재 팔고 있는 가격, 마진은 얼마인가요?
                <br />
                편리한 저장기능까지 체험해보세요.
              </dd>
              <dt>마진계산기 무료 사용</dt>
              <dd className="btn_start">
                <Button
                  onClick={() => {
                    is_authed() ? navigate('/settlement/margin_calc') : navigate('/login');
                  }}
                >
                  <img src={`${img_src}${btn_start}`} />
                </Button>
              </dd>
            </dl>
            <img src={`${img_src}${banner_07}`} />
          </div>
        </Slider>

        <Slider
          className="bannerslide mobile"
          modalState={sliderState}
          setModalState={setSliderState}
          autoplay={true}
          autoplaySpeed={6000}
          slidesToShow={1}
          slidesToScroll={1}
        >
          <div className="bannerwrap">
            <img src={`${img_src}${banner_01_m}`} />
          </div>
          <div className="bannerwrap">
            <img src={`${img_src}${banner_02_m}`} />
          </div>
          <div className="bannerwrap">
            <img src={`${img_src}${banner_05_m}`} />
          </div>
        </Slider>
        <div
          id="main01"
          style={{
            marginBottom: '50px',
          }}
        ></div>
        <section className="main01 pc">
          <h3>서비스 소개</h3>
          <h4>
            어떤 솔루션에서도 제대로 된 정산 기능을 찾을 수 없어서 직접 만들었습니다.
            <br />
            강력한 정산 기능과 판매 활동에 필요한 손익 데이터의 제공은 ‘셀라’의 핵심적인 목표입니다.
            <br />
            각종 화면은 관리가 편하도록 간편하게 만들었고
            <br />
            확장되는 기능들은 지속적으로 추가될 예정입니다.
          </h4>

          {/* 오른쪽 글씨 (slider-nav) 의 li 클릭 시 해당 li에 on 클래스 넣어주시고 
왼쪽 이미지 (slide-for) 의 해당 순번 li에도 on 넣어주세요. 
혹시 fade 효과를 넣을 수 있으면 부탁드려요! */}

          <ul className="slider-for">
            <li className={currentLiTag === 0 ? 'on' : ''}>
              <img src={`${img_src}${main01_01}`} />
            </li>
            <li className={currentLiTag === 1 ? 'on' : ''}>
              <img src={`${img_src}${main01_02}`} />
            </li>
            <li className={currentLiTag === 2 ? 'on' : ''}>
              <img src={`${img_src}${main01_03}`} />
            </li>
            <li className={currentLiTag === 3 ? 'on' : ''}>
              <img src={`${img_src}${main01_04}`} />
            </li>
          </ul>

          <ul className="slider-nav">
            <li
              className={currentLiTag === 0 ? 'on' : ''}
              onClick={(e) => {
                setCurrentLiTag(0);
              }}
            >
              빠른 손익계산
              <p>
                신규 접수된 주문 데이터 업로드만으로 간단하게 손익 계산을 할 수 있습니다. 출고 하기 전 손익 결과 확인
                만으로도 손해가 큰 주문건의 출고를 막을 수 있죠.
              </p>
            </li>
            <li
              className={currentLiTag === 1 ? 'on' : ''}
              onClick={(e) => {
                setCurrentLiTag(1);
              }}
            >
              손익 캘린더
              <p>
                업로드한 주문서의 저장으로 매일 판매한 실제 매출, 손익 계산 결과, 택배 발송 건수 등 비즈니스에 꼭 필요한
                정산 데이터를 한눈에 볼 수 있습니다.
              </p>
            </li>
            <li
              className={currentLiTag === 2 ? 'on' : ''}
              onClick={(e) => {
                setCurrentLiTag(2);
              }}
            >
              복잡한 양식 관리는 이제 그만
              <p>
                다른 솔루션에서 경험했던 복잡한 양식설정 화면은 잊으세요. ‘셀라’는 여러분이 정산에 들이는 시간을 최소화
                할 수 있도록 노력했습니다.
              </p>
            </li>
            <li
              className={currentLiTag === 3 ? 'on' : ''}
              onClick={(e) => {
                setCurrentLiTag(3);
              }}
            >
              마진계산기 · 최저가계산기
              <p>
                내 상품의 가격이 적절한지 몇초만에 계산하고 저장하세요. 한눈에 상품들의 마진율 리스트를 파악 할 수
                있습니다.
              </p>
            </li>
          </ul>
        </section>

        <section className="main01 mobile" id="m_main01">
          <ul>
            <li>
              빠른 손익계산
              <p>
                신규 접수된 주문 데이터 업로드만으로 간단하게 손익 계산을 할 수 있습니다. 출고 하기 전 손익 결과 확인
                만으로도 손해가 큰 주문건의 출고를 막을 수 있죠.
              </p>
              <img src={`${img_src}${main01_01}`} />
            </li>
            <li>
              손익 캘린더
              <p>
                업로드한 주문서의 저장으로 매일 판매한 실제 매출, 손익 계산 결과, 택배 발송 건수 등 비즈니스에 꼭 필요한
                정산 데이터를 한눈에 볼 수 있습니다.
              </p>
              <img src={`${img_src}${main01_02}`} />
            </li>
            <li>
              복잡한 양식 관리는 이제 그만
              <p>
                다른 솔루션에서 경험했던 복잡한 양식설정 화면은 잊으세요. ‘셀라’는 여러분이 정산에 들이는 시간을 최소화
                할 수 있도록 노력했습니다.
              </p>
              <img src={`${img_src}${main01_03}`} />
            </li>
            <li>
              마진계산기 · 최저가계산기
              <p>
                내 상품의 가격이 적절한지 몇초만에 계산하고 저장하세요. 한눈에 상품들의 마진율 리스트를 파악 할 수
                있습니다.
              </p>
              <img src={`${img_src}${main01_04}`} />
            </li>
          </ul>
        </section>
        <div
          id="main02"
          style={{
            marginBottom: '50px',
          }}
        ></div>
        <section className="main02">
          <h3>‘셀라’ 더 알아보기</h3>
          <h4>유용한 정보를 참고하세요.</h4>

          <ul>
            <li>
              <dl>
                <dt>셀라 고객센터 (CS center)</dt>
                <dd>셀라 채널을 추가하고, 실시간 채팅으로 빠르게 상담 받을 수 있습니다.</dd>
                <dd className="dd_btn kakaotalk">
                  <Button>
                    <img
                      src={`${img_src}${btn_kakaotalk}`}
                      onClick={() => {
                        window.open('http://pf.kakao.com/_AxfxfMG/chat');
                      }}
                    />
                  </Button>
                </dd>
              </dl>
              <dl className="line">
                <dt>첨부파일 보내실 곳</dt>
                <dd>sellacscenter@google.com</dd>
              </dl>
              <dl className="line">
                <dt>고객센터 번호</dt>
                <dd>070-8028-4426</dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>셀라 유저들을 위한 가이드 컨텐츠</dt>
                <dd>셀라 도입 검토 및 궁금한 사용법에 대해 참고해 보세요.</dd>
                <dd className="dd_btn_down">
                  <Button
                    onClick={() => {
                      modal.alert('서비스 준비중입니다.');
                    }}
                    className="btn_down"
                  >
                    서비스 소개서 다운로드
                  </Button>
                </dd>
                <dd className="dd_btn">
                  <Button
                    onClick={() => {
                      modal.alert('서비스 준비중입니다.');
                    }}
                  >
                    <img src={`${img_src}${icon_arrow_right2}`} />
                  </Button>
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>자주 묻는 질문</dt>
                <dd>자주 묻는 질문을 통해 셀라 이용에 도움을 받아보세요.</dd>
                <dd className="dd_btn">
                  <Button
                    onClick={() => {
                      navigate('/cscenter/faq');
                    }}
                  >
                    <img src={`${img_src}${icon_arrow_right2}`} />
                  </Button>
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>서비스 업데이트는 언제 되나요?</dt>
                <dd>
                  셀라 베타 서비스는 꼭 필요한 정산기능 위주로 우선 런칭되었습니다.
                  <br />
                  쇼핑몰 셀러들을 위한 여러가지 기능을 더해 더 많은 혜택으로 곧 순차 오픈 예정입니다.
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>구매 전에 일단 써보고 구매하는 방법은 없나요?</dt>
                <dd>
                  셀라 베타 서비스는 회원가입만으로도 14일간 모든 기능을 무료로 사용가능합니다.
                  <br />
                  무료 사용기간이 종료된 후 이용료를 결제하시면 됩니다.
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>이용료 결제는 어떻게 하나요?</dt>
                <dd>
                  이용료 결제는 선불제 방식입니다.
                  <br />
                  14일 무료사용기간이 끝나면 1개월 단위로 비용을 선납하시고 사용하는 방식입니다.
                  <br /> 또한 6개월 / 1년 선납 방식도 있으며 이 경우 적절한 혜택이 주어집니다.
                </dd>
              </dl>
            </li>
          </ul>
        </section>

        <div
          id="main03"
          style={{
            marginBottom: '50px',
          }}
          className="hidden"
        ></div>
        <section className="main03 hidden">
          <h3>요금제 유형</h3>
          <h4>꼭 필요한 기능을 준비했습니다.</h4>

          <ul className="payoptionbox">
            <li>
              <p>
                Free<span>0 원 / 무료체험 기간 14일</span>
                <img src={`${img_src}${img_stamp14days}`} />
              </p>
              <span>
                회원가입만으로 14일간
                <br />
                셀라의 모든 기능을 체험하세요.
              </span>
              <ol>
                <li>기준 상품 관리</li>
                <li>손익 계산</li>
                <li>손익 캘린더</li>
                <li>마진 계산기 (계산 결과 저장)</li>
                <li>최저가 계산기 (계산 결과 저장)</li>
              </ol>
              <hr />
              <span>
                온라인 비즈니스에 필요한
                <br />
                계산기 기능을 <b>평생 무료</b>로 사용하세요.
              </span>
              <ol>
                <li>마진 계산기 (저장 기능 x)</li>
                <li>최저가 계산기 (저장 기능 x)</li>
              </ol>
              <Button>무료 사용 신청</Button>
            </li>

            <li>
              <p>
                Basic
                <span>
                  19,900 원 / 월<i>(VAT 별도)</i>
                </span>
              </p>
              <span>
                매출 집계와 손익 계산에 최적화된
                <br />
                셀라의 기능을 사용하고 싶다면
              </span>
              <ol>
                <li>기준 상품 관리</li>
                <li>손익 계산</li>
                <li>손익 캘린더</li>
                <li>마진 계산기 (계산 결과 저장)</li>
                <li>최저가 계산기 (계산 결과 저장)</li>
              </ol>

              {/* <hr /><p className="txt_blue">
                정기결제 할인 특가
                <img src={`${img_src}${img_stamp10sale}`} />
              </p>
              <span>
                정기 결제 신청하고
                <br />
                반드시 누려야할 10% 할인!
              </span>
              <div className="salebox">
                <dl>
                  <dt>정상가</dt>
                  <dd>
                    19,900<i>원</i>
                    <img src={`${img_src}${img_salearrow}`} />
                  </dd>
                </dl>
                <dl>
                  <dt>정기결제 10% OFF</dt>
                  <dd>
                    17,900<i>원</i>
                  </dd>
                </dl>
              </div> */}

              <hr />

              <select name="" id="">
                <option value="">결제 옵션 선택</option>
                <option value="">정기 결제 특가 : 17,900 원 (vat별도)</option>
                <option value="">1달 결제 : 19,900 원 (vat별도)</option>
              </select>
              <Button>요금제 선택하기</Button>
            </li>

            <li>
              <p>
                Pro
                <span>
                  29,900 원 / 월<i>(VAT 별도)</i>
                </span>
              </p>
              <span>
                앞으로 업데이트 될
                <br />
                셀라의 모든 기능을 기대해주세요.
              </span>
              <ol>
                <li className="star">Basic의 모든 서비스를 포함 +</li>
                <li>10대 판매 매체 추가 지원</li>
                <li>쇼핑몰 데이터 자동 연동</li>
                <li>재고 관리</li>
                <li>입/출고 관리</li>
                <li>택배사 연동/송장 출력</li>
                <li>통계 관리</li>
                <li>마케팅 솔루션</li>
              </ol>
              <Button>오픈 준비 중</Button>
            </li>

            {/* <li>
              <p>
                Expert
                <span>
                  별도 협의<i>(VAT 별도)</i>
                </span>
              </p>
              <span>
                셀라 서비스를
                <br />
                맞춤형으로 사용하고 싶다면
              </span>
              <ol>
                <li>개별 상담 필요</li>
                <li>커스터 마이징</li>
                <li>엔지니어 기술 도움</li>
                <li>서비스 제휴 신청</li>
              </ol>
              <Button>상담 신청</Button>
            </li> */}
          </ul>
        </section>

        <div
          id="main04"
          style={{
            marginBottom: '50px',
          }}
          className="hidden"
        ></div>
        <section className="main04">
          <div>
            <h3>시작이 어려우신가요?</h3>
            <h4>교육 받아보시면 쉽습니다.</h4>
            <Button
              onClick={() => {
                window.open('http://pf.kakao.com/_AxfxfMG/chat');
              }}
            >
              1:1 교육 신청하기
            </Button>
          </div>
        </section>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Home);
