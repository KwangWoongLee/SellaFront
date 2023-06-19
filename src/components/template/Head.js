import React, { useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import 'styles/Template.scss';
import { navigate, logger } from 'util/com';

import Recoils from 'recoils';

import logo_top from 'images/logo_top.svg';
import icon_member from 'images/icon_member.svg';
import icon_power from 'images/icon_power.svg';

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

  return (
    <>
      <div className="header">
        <Nav.Link onClick={onLink} className="logo" name="/">
          <img src={logo_top} alt="로고" />
        </Nav.Link>
        <div className="menu">
          <ul className="left">
            <li>
              <Nav.Link className="nav-link" onClick={onLink} name="/settlement/tab1">
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
          {account && account.grade !== -1 ? (
            <>
              <span>{account.name} 님</span>
              <Nav.Link className="nav-link" onClick={onLink} name="/calculator/margin">
                <img src={icon_member} alt="" />
              </Nav.Link>
              <Nav.Link className="nav-link" onClick={onLink} name="/cscenter">
                <div className="cscenter">고객센터</div>
              </Nav.Link>
              <Nav.Link className="nav-link" onClick={onLink} name="/mypage">
                <img src={icon_member} alt="" />
              </Nav.Link>
              <Nav.Link className="nav-link" onClick={onLink} name="/logout">
                <img src={icon_power} alt="" />
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link className="nav-link" onClick={onLink} name="/regist">
                <div className="cscenter">회원가입</div>
              </Nav.Link>
              <Nav.Link className="nav-link" onClick={onLink} name="/login">
                <div className="cscenter">로그인</div>
              </Nav.Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Head);
