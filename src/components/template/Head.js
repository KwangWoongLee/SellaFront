import React, { useEffect, useRef, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import com, { img_src, navigate, logger, is_authed } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import Checkbox from 'components/common/CheckBoxCell';
import logo_white from 'images/logo_white.svg';
import icon_member from 'images/icon_member.svg';
import icon_power from 'images/icon_power.svg';
import icon_calculator from 'images/icon_calculator.svg';
import icon_kakao from 'images/icon_kakao.svg';
import icon_hamburger from 'images/icon_hamburger.svg';
import icon_arrow_back from 'images/icon_arrow_back.svg';

const Head = () => {
  //logger.debug('Template Head');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const location = useLocation();
  const nodeRef = useRef(null);
  const [transition, setTransition] = useState(false);

  useEffect(() => {}, []);
  const onLink = (e, no_login_path) => {
    e.preventDefault();
    logger.debug('href : ', e.currentTarget.name);
    if (no_login_path) {
      navigate(no_login_path);
    } else {
      navigate(e.currentTarget.name);
    }

    //logger.debug('NavigateCtr :');
  };

  return (
    <>
      <div id="header" className="header v02">
        <div>
          <Nav.Link onClick={onLink} name="" className="btn_arrow_back">
            <img alt={''} src={icon_arrow_back} />
          </Nav.Link>

          <Nav.Link onClick={onLink} className="logo" name={is_authed() ? '/' : ''}>
            <img src={`${img_src}${logo_white}`} alt="로고" />
          </Nav.Link>

          <input
            type="checkbox"
            id="input_hamburger"
            onClick={() => {
              if (transition) {
                setTransition(false);
                return;
              }
              setTransition(true);
            }}
          />
          <label for="input_hamburger" id="btn_hamburger">
            <span></span>
          </label>

          <CSSTransition
            in={transition}
            nodeRef={nodeRef}
            timeout={300}
            appear={true}
            classNames="burder-transition"
            unmountOnExit={true}
            onClick={(e) => {
              const isLiTag = _.includes(e.target.className, 'nav-link');
              if (!isLiTag) {
                setTransition(false);
              }

              const hamburgerElem = document.getElementById('input_hamburger');
              if (hamburgerElem) {
                hamburgerElem.checked = false;
              }
            }}
          >
            <ul className={`burder`} ref={nodeRef}>
              <li>
                <ul className="sub-menu">
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={() => {
                        // onScroll('m_main01');
                        com.storage.setItem('header_nologin_select', '1');
                        navigate('/');
                        setTransition(false);
                      }}
                    >
                      서비스 소개
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={() => {
                        com.storage.setItem('header_nologin_select', '2');
                        navigate('/');
                        setTransition(false);
                      }}
                    >
                      더 알아보기
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={() => {
                        com.storage.setItem('header_nologin_select', '3');
                        navigate('/');
                        setTransition(false);
                      }}
                    >
                      요금제
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={() => {
                        com.storage.setItem('header_nologin_select', '4');
                        navigate('/');
                        setTransition(false);
                      }}
                    >
                      1:1 상담
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                        onLink(e, no_login_path);
                      }}
                      name="/calculator/margin_free"
                    >
                      마진 계산기
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link className="nav-link bcalculator" onClick={onLink} name="/calculator/lowest_price_free">
                      최저가 계산기
                    </Nav.Link>
                  </li>
                  <li className="line"></li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/cscenter/announcement">
                      공지사항
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/cscenter/faq">
                      자주 묻는 질문
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/cscenter/manual">
                      사용방법
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link cschat" name="/cschat">
                      <button
                        onClick={() => {
                          window.open('http://pf.kakao.com/_AxfxfMG/chat');
                        }}
                      ></button>
                      문의하기
                    </Nav.Link>
                  </li>
                  {account && account.grade !== -1 ? (
                    <>
                      <li className="small">
                        <Nav.Link className="nav-link icon_member" onClick={onLink} name="/mypage/membership">
                          마이페이지
                        </Nav.Link>
                      </li>
                      <li className="small">
                        <Nav.Link className="nav-link icon_power" onClick={onLink} name="/logout">
                          로그아웃
                        </Nav.Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="small">
                        <Nav.Link className="nav-link" onClick={onLink} name="/regist">
                          회원가입
                        </Nav.Link>
                      </li>
                      <li className="small">
                        <Nav.Link className="nav-link" onClick={onLink} name="/search/id">
                          아이디 찾기
                        </Nav.Link>
                      </li>
                      <li className="small">
                        <Nav.Link className="nav-link" onClick={onLink} name="/search/password">
                          비밀번호 찾기
                        </Nav.Link>
                      </li>
                      <li className="small">
                        <Nav.Link className="nav-link" onClick={onLink} name="/login">
                          로그인
                        </Nav.Link>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </CSSTransition>

          <nav>
            <ul className="left">
              <li
                className={
                  location.pathname === '/settlement/margin_calc' || location.pathname === '/settlement/today_summary'
                    ? 'on'
                    : ''
                }
              >
                <Nav.Link className="nav-link" onClick={onLink} name="/settlement/margin_calc">
                  <p>
                    <span>정산해보기!</span>손익 관리
                  </p>{' '}
                </Nav.Link>
              </li>
            </ul>
            <ul className="center">
              <li className={location.pathname === '/step2' ? 'on' : ''}>
                <Nav.Link onClick={onLink} name="/step2">
                  <p>
                    <span>1단계</span>기준 상품 관리
                  </p>{' '}
                </Nav.Link>
              </li>
              <li
                className={
                  location.pathname === '/settlement/form_management' ||
                  location.pathname === '/settlement/sale_product' ||
                  location.pathname === '/settlement/standard_product'
                    ? 'on'
                    : ''
                }
              >
                <Nav.Link onClick={onLink} name="/settlement/form_management">
                  <p>
                    <span>2단계</span>매체 관리
                  </p>
                </Nav.Link>
              </li>
            </ul>
            <div className="member">
              <img src={`${img_src}${icon_calculator}`} alt="계산기" className="icon_calculator" />
              <Nav.Link
                className="nav-link mcalculator"
                onClick={(e) => {
                  let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                  onLink(e, no_login_path);
                }}
                name="/calculator/margin"
              >
                <span>마진계산기</span>
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={(e) => {
                  onLink(e);
                }}
                name="/calculator/lowest_price_free"
              >
                <span>최저가 계산기</span>
              </Nav.Link>
              {/* <span>·</span>
          <Nav.Link className="nav-link bcalculator" onClick={onLink} name="/calculator/buying">
            <span>사입계산기</span>
          </Nav.Link> */}
              <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                <span className="cscenter">고객센터</span>
              </Nav.Link>
              <img
                onClick={() => {
                  window.open('http://pf.kakao.com/_AxfxfMG/chat');
                }}
                src={`${img_src}${icon_kakao}`}
                alt="카카오"
                className="icon_kakao"
              />

              <span
                onClick={() => {
                  window.open('http://pf.kakao.com/_AxfxfMG/chat');
                }}
                className="cschat"
              >
                1:1문의
              </span>
              {account && account.grade !== -1 ? (
                <>
                  <span class="name">{account.name}</span>
                  <Nav.Link className="nav-link icon_member" onClick={onLink} name="/mypage/membership">
                    <img src={`${img_src}${icon_member}`} alt="" />
                  </Nav.Link>
                  <Nav.Link className="nav-link icon_power" onClick={onLink} name="/logout">
                    <img src={`${img_src}${icon_power}`} alt="" />
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link className="nav-link" onClick={onLink} name="/regist">
                    <span className="cscenter">회원가입</span>
                  </Nav.Link>
                  <Nav.Link className="nav-link" onClick={onLink} name="/login">
                    <span className="cscenter">로그인</span>
                  </Nav.Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};
export default React.memo(Head);
