import React, { useEffect, useRef, useState } from 'react';
import { Nav, Button } from 'react-bootstrap';
import 'styles/Template.scss';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import { img_src, navigate, logger } from 'util/com';
import Recoils from 'recoils';
import Checkbox from 'components/common/CheckBoxCell';
import logo_white from 'images/logo_white.svg';
import icon_member from 'images/icon_member.svg';
import icon_power from 'images/icon_power.svg';
import icon_calculator from 'images/icon_calculator.svg';
import icon_kakao from 'images/icon_kakao.svg';

import 'styles/mediaQuery_1000.scss';

import icon_hamburger from 'images/icon_hamburger.svg';
import icon_arrow_back from 'images/icon_arrow_back.svg';
const Head = () => {
  //logger.debug('Template Head');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const location = useLocation();
  const nodeRef = useRef(null);
  const [transition, setTransition] = useState(false);

  const [burderClass, setBurderClass] = useState('');

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
      <div className="header v02 home">
        <div>
          <Nav.Link onClick={onLink} name="" className="btn_arrow_back">
            <img alt={''} src={icon_arrow_back} />
          </Nav.Link>

          <Nav.Link onClick={onLink} className="logo" name="">
            <img src={`${img_src}${logo_white}`} alt="로고" />
          </Nav.Link>

          <Nav.Link
            onClick={() => {
              if (burderClass === '') {
                setBurderClass('on');
                setTransition(true);
              } else {
                setBurderClass('');
                setTransition(false);
              }
            }}
            name=""
            className="btn_hamburger"
          >
            <img alt={''} src={icon_hamburger} />
          </Nav.Link>

          <nav>
            <ul className="center">
              <li>
                <Nav.Link onClick={onLink} href="#main01">
                  서비스 소개
                </Nav.Link>
              </li>
              <li>
                <Nav.Link onClick={onLink} href="#main02">
                  더 알아보기
                </Nav.Link>
              </li>
              <li>
                <Nav.Link onClick={onLink} href="#main03">
                  요금제
                </Nav.Link>
              </li>
              <li>
                <Nav.Link onClick={onLink} href="#main04">
                  이용방법
                </Nav.Link>
              </li>
            </ul>
            <div className="member">
              <img src={`${img_src}${icon_calculator}`} alt="계산기" className="icon_calculator" />
              <Nav.Link
                className="nav-link"
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
                name="/calculator/lowest_price"
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

          {/* .btn_hamburger 클릭이벤트에 따라 .burder에 on 클래스 토글로 넣어주세요~ 혹시 메뉴 열릴때 스르륵 열리게 가능할까요? 매체양식관리처럼요!

        ul.burder backgound 까만 반투명 클릭 시 스르륵 닫히게 부탁드려요!
         */}
          <CSSTransition
            in={transition}
            nodeRef={nodeRef}
            timeout={300}
            appear={true}
            classNames="form-add-transition"
            unmountOnExit={true}
          >
            <ul className={`burder ${burderClass}`}>
              {/* <ul className="burder on"> */}
              <li>
                <ul class="sub-menu">
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '#main01';
                        onLink(e, no_login_path);
                      }}
                    >
                      서비스 소개
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                        onLink(e, no_login_path);
                      }}
                      name="/calculator/margin"
                    >
                      더 알아보기
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                        onLink(e, no_login_path);
                      }}
                      name="/calculator/margin"
                    >
                      요금제
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                        onLink(e, no_login_path);
                      }}
                      name="/calculator/margin"
                    >
                      이용방법
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link
                      className="nav-link"
                      onClick={(e) => {
                        let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                        onLink(e, no_login_path);
                      }}
                      name="/calculator/margin"
                    >
                      마진 계산기
                    </Nav.Link>
                  </li>
                  <li>
                    <Nav.Link className="nav-link bcalculator" onClick={onLink} name="/calculator/buying">
                      최저가 계산기
                    </Nav.Link>
                  </li>
                  <li className="line"></li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                      고객센터
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                      자주 묻는 질문
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link cschat" name="/cschat">
                      <button
                        onClick={() => {
                          window.open('http://pf.kakao.com/_AxfxfMG/chat');
                        }}
                      ></button>
                      1:1문의
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/regist">
                      회원가입
                    </Nav.Link>
                  </li>
                  <li className="small">
                    <Nav.Link className="nav-link" onClick={onLink} name="/login">
                      로그인
                    </Nav.Link>
                  </li>
                </ul>
              </li>
            </ul>
          </CSSTransition>
        </div>
      </div>
    </>
  );
};
export default React.memo(Head);
