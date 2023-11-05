import React, { useEffect } from 'react';
import { Nav, Button } from 'react-bootstrap';
import 'styles/Template.scss';
import { useLocation } from 'react-router-dom';

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
        <Nav.Link onClick={onLink} name="" className="btn_arrow_back">
          <img alt={''} src={icon_arrow_back} />
        </Nav.Link>

        <Nav.Link onClick={onLink} className="logo" name="">
          <img src={`${img_src}${logo_white}`} alt="로고" />
        </Nav.Link>

        <nav>
          <ul className="center">
            <li className={location.pathname === '/step2' ? 'on' : ''}>
              <Nav.Link onClick={onLink} name="/step2">
                <p>서비스 소개</p>{' '}
              </Nav.Link>
            </li>
            <li className={location.pathname === '/step2' ? 'on' : ''}>
              <Nav.Link onClick={onLink} name="/step2">
                <p>더 알아보기</p>{' '}
              </Nav.Link>
            </li>
            <li className={location.pathname === '/step2' ? 'on' : ''}>
              <Nav.Link onClick={onLink} name="/step2">
                <p>요금제</p>{' '}
              </Nav.Link>
            </li>
            <li className={location.pathname === '/step2' ? 'on' : ''}>
              <Nav.Link onClick={onLink} name="/step2">
                <p>이용방법</p>{' '}
              </Nav.Link>
            </li>
          </ul>
          {/* <ul className="burder"> 클릭이벤트에 따라 on 클래스 넣어주세요~ 메뉴가 활성화됩니다~
           */}
          <ul className="burder on">
            <li>
              {/* <Button className="btn_hamburger btn btn-primary">
                <img alt={''} src={icon_hamburger} />
              </Button> */}
              <Nav.Link onClick={onLink} name="">
                <img alt={''} src={icon_hamburger} />
              </Nav.Link>
              <ul class="sub-menu">
                <li>
                  <Nav.Link
                    className="nav-link mcalculator"
                    onClick={(e) => {
                      let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                      onLink(e, no_login_path);
                    }}
                    name="/calculator/margin"
                  >
                    <span>서비스 소개</span>
                  </Nav.Link>
                </li>
                <li>
                  <Nav.Link
                    className="nav-link mcalculator"
                    onClick={(e) => {
                      let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                      onLink(e, no_login_path);
                    }}
                    name="/calculator/margin"
                  >
                    <span>더 알아보기</span>
                  </Nav.Link>
                </li>
                <li>
                  <Nav.Link
                    className="nav-link mcalculator"
                    onClick={(e) => {
                      let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                      onLink(e, no_login_path);
                    }}
                    name="/calculator/margin"
                  >
                    <span>요금제</span>
                  </Nav.Link>
                </li>
                <li>
                  <Nav.Link
                    className="nav-link mcalculator"
                    onClick={(e) => {
                      let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                      onLink(e, no_login_path);
                    }}
                    name="/calculator/margin"
                  >
                    <span>이용방법</span>
                  </Nav.Link>
                </li>
                <li>
                  <Nav.Link
                    className="nav-link mcalculator"
                    onClick={(e) => {
                      let no_login_path = account && account.grade !== -1 ? '' : '/calculator/margin_free';
                      onLink(e, no_login_path);
                    }}
                    name="/calculator/margin"
                  >
                    <span>마진 계산기</span>
                  </Nav.Link>
                </li>
                <li>
                  <Nav.Link className="nav-link bcalculator" onClick={onLink} name="/calculator/buying">
                    <span>최저가 계산기</span>
                  </Nav.Link>
                </li>
                <li className="small">
                  <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                    <span className="cscenter">고객센터</span>
                  </Nav.Link>
                </li>
                <li className="small">
                  <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                    <span className="cscenter">자주 묻는 질문</span>
                  </Nav.Link>
                </li>
                <li className="small">
                  <Nav.Link className="nav-link cschat" name="/cschat">
                    <button
                      onClick={() => {
                        window.open('http://pf.kakao.com/_AxfxfMG/chat');
                      }}
                    ></button>
                    <span className="cschat">1:1문의</span>
                  </Nav.Link>
                </li>
                <li className="small">
                  <Nav.Link className="nav-link" onClick={onLink} name="/regist">
                    <span className="cscenter">회원가입</span>
                  </Nav.Link>
                </li>
                <li className="small">
                  <Nav.Link className="nav-link" onClick={onLink} name="/login">
                    <span className="login">로그인</span>
                  </Nav.Link>
                </li>
              </ul>
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
      </div>
    </>
  );
};
export default React.memo(Head);
