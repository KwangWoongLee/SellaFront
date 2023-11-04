import React, { useEffect } from 'react';
import { img_src, logger } from 'util/com';

import 'styles/Template.scss';

import logo_blue from 'images/logo_blue.svg';
// import logo_footer from 'images/logo_footer.svg';

const Footer = () => {
  //logger.debug('Template Footer');
  useEffect(() => {}, []);

  return (
    <>
      <div className="footer">
        <div className="menubox">
          <ul>
            <li>
              <a href="https://sella.co.kr/cscenter">개인정보처리방침</a>
            </li>
            <li>
              <a href="https://sella.co.kr/cscenter">이용약관</a>
            </li>
            <li>
              <a href="https://sella.co.kr/cscenter/announcement">공지사항</a>
            </li>
            <li>
              <a href="https://sella.co.kr/cscenter">고객센터</a>
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
