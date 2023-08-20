import React, { useEffect, useState } from 'react';
import { Button, Navbar, Nav, NavDropdown, DropdownButton, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import 'styles/Template.scss';
import { useLocation } from 'react-router-dom';

import { img_src, navigate, modal, logger } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import com from 'util/com';
import _ from 'lodash';
import logo_white from 'images/logo_white.svg';
import icon_member from 'images/icon_member.svg';
import icon_power from 'images/icon_power.svg';
import icon_calculator from 'images/icon_calculator.svg';
import icon_kakao from 'images/icon_kakao.svg';
const Head = () => {
  logger.render('Template Head');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const location = useLocation();

  useEffect(() => {}, []);
  const onLink = (e) => {
    e.preventDefault();
    logger.debug('href : ', e.currentTarget.name);
    navigate(e.currentTarget.name);

    logger.render('NavigateCtr :');
  };
  return (
    <>
      <div className="header">
        <Nav.Link onClick={onLink} className="logo" name="/settlement/margin_calc">
          <img src={`${img_src}${logo_white}`} alt="로고" />
        </Nav.Link>
        <div className="menu">
          <ul className="left">
            <li className={location.pathname == '/settlement/margin_calc' ? 'on' : ''}>
              <Nav.Link className="nav-link" onClick={onLink} name="/settlement/margin_calc">
                <span>정산해보기!</span>손익 관리
              </Nav.Link>
            </li>
          </ul>
          <ul className="right">
            <li className={location.pathname == '/step1' ? 'on' : ''}>
              <Nav.Link className="nav-link" onClick={onLink} name="/step1">
                <span>1단계</span>기초 정보 관리
              </Nav.Link>
            </li>
            <li className={location.pathname == '/step2' ? 'on' : ''}>
              <Nav.Link onClick={onLink} name="/step2">
                <span>2단계</span>상품 관리
              </Nav.Link>
            </li>
          </ul>
        </div>
        <div className="member">
          <img src={`${img_src}${icon_calculator}`} alt="계산기" className="icon_calculator" />
          <Nav.Link className="nav-link mcalculator" onClick={onLink} name="/calculator/margin">
            <span>마진계산기</span>
          </Nav.Link>
          <span>·</span>
          <Nav.Link className="nav-link bcalculator" onClick={onLink} name="/calculator/buying">
            <span>사입계산기</span>
          </Nav.Link>
          <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
            <span className="cscenter">고객센터</span>
          </Nav.Link>
          <Nav.Link className="nav-link cschat" name="/cschat">
            <img src={`${img_src}${icon_kakao}`} alt="카카오" className="icon_kakao" />
            <span className="cschat">1:1문의</span>
          </Nav.Link>
          {account && account.grade != -1 ? (
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
      </div>
    </>
  );
};
export default React.memo(Head);
