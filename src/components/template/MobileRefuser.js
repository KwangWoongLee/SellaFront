import React, { useEffect } from 'react';
import com, { img_src } from 'util/com';

import {} from 'react-bootstrap';
import _ from 'lodash';

import { logger } from 'util/com';

import img_service from 'images/img_service.png';

const MobileRefuser = () => {
  return (
    <>
      <h3 className="mobileBg">
        <div>
          주문서를 업로드하고
          <br /> 손익을 관리하세요!
          <p>
            <span className="txt_red">PC버전 셀라에서</span>
            <br />
            모든 기능을 사용하실 수 있습니다
          </p>
          <img src={`${img_src}${img_service}`} />
        </div>
      </h3>
    </>
  );
};

export default React.memo(MobileRefuser);
