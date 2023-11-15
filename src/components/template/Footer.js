import React, { useEffect } from 'react';
import { img_src, logger, navigate } from 'util/com';

import { Nav } from 'react-bootstrap';

import logo_blue from 'images/logo_blue.svg';
// import logo_footer from 'images/logo_footer.svg';

const Footer = () => {
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
      <div className="footer">
        <div className="menubox">
          <ul>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter/announcement">
                개인정보처리방침
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter/announcement">
                이용약관
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter/announcement">
                공지사항
              </Nav.Link>
            </li>
            <li>
              <Nav.Link onClick={onLink} className="logo" name="/cscenter">
                고객센터
              </Nav.Link>
            </li>
          </ul>
        </div>
        <div className="informbox">
          <img src={`${img_src}${logo_blue}`} alt="로고" />
          <dl>
            <dd>셀러라면, 셀라(SELLA)</dd>
            <dd className="left">상담전화 : 070-8028-4426</dd>
            <dd>주소 : 경기도 양주시 부흥로 1936, 405호</dd>
            <dd className="left">대표 : 박효은</dd>
            <dd>개인정보책임자 : 이광웅(lgu4821@gmail.com)</dd>
            <dd className="left">사업자 등록번호 : 701-34-01219</dd>
            <dd>통신판매업신고 : 제 2023-경기양주-1712 호</dd>
            <dd>COPYRIGHT 2023 BY SELLA ALL RIGHTS RESERVED.</dd>
          </dl>
        </div>
      </div>
    </>
  );
};

export default React.memo(Footer);
