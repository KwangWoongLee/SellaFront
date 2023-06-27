import React, { useEffect, useState } from 'react';
import { Button, Navbar, Nav, NavDropdown, DropdownButton, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import 'styles/Template.scss';
import { navigate, modal, logger } from 'util/com';
import request from 'util/request';
import Recoils from 'recoils';
import com from 'util/com';
import _ from 'lodash';
import logo_top from 'images/logo_top.svg';
import icon_member from 'images/icon_member.svg';
import icon_power from 'images/icon_power.svg';
import icon_calculator from 'images/icon_calculator.svg';
import icon_kakao from 'images/icon_kakao.svg';
const Head = () => {
  logger.render('Template Head');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  useEffect(() => {}, []);
  const onLink = (e) => {
    e.preventDefault();
    const href = e.currentTarget.name;
    logger.debug('href : ', href);
    navigate(href);
  };
  // 아래로 스크롤되면 상단 헤더가 고정이 되었으면 좋겠는데, 혹시 스크롤 이벤트 발생하면 <div className="header"> 클래스에 추가해서 on/off 이런식으로 바뀌게 해 주실수 있을까요?
  // 이왕 깜빡거리지 않게 스무스하게 변경되면 좋을것 같아요. 제가 뭐라도 하고싶은데 뷰는 진짜 손도 못대겠네요 ...ㅎㅎㅎㅎㅎ
  return (
    <>
      <div className="header">
        <Nav.Link onClick={onLink} className="logo" name="/">
          <img src={logo_top} alt="로고" />
        </Nav.Link>
        <div className="menu">
          <ul className="left">
            <li>
              <Nav.Link className="nav-link" onClick={onLink} name="/settlement/margin_calc">
                <span>정산해보기!</span>손익 관리
              </Nav.Link>
            </li>
          </ul>
          <ul className="right">
            <li>
              <Nav.Link className="nav-link" onClick={onLink} name="/step1">
                <span>1단계</span>기초 정보 관리
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} name="/step2">
                <span>2단계</span>상품 관리
              </Nav.Link>
            </li>
          </ul>
        </div>
        <div className="member">
          <img src={icon_calculator} alt="계산기" className="icon_calculator" />
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
            <img src={icon_kakao} alt="카카오" className="icon_kakao" />
            <span className="cschat">1:1문의</span>
          </Nav.Link>
          {account && account.grade != -1 ? (
            <>
              <span class="name">{account.name}</span>
              <Nav.Link className="nav-link icon_member" onClick={onLink} name="/mypage">
                <img src={icon_member} alt="" />
              </Nav.Link>
              <Nav.Link className="nav-link icon_power" onClick={onLink} name="/logout">
                <img src={icon_power} alt="" />
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
