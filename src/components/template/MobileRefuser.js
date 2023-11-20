import React, { useEffect } from 'react';

import {} from 'react-bootstrap';
import _ from 'lodash';

import { logger } from 'util/com';

const MobileRefuser = () => {
  return (
    <>
      <h3>
        주문서를 업로드하고
        <br className="mobile" /> 손익을 관리하세요!
        <p className="pc">
          오늘 들어온 주문, <span className="txt_red">순이익</span>은 얼마인가요?
        </p>
        <p className="mobile">
          <span className="txt_red">PC버전 셀라에서</span>
          <br className="mobile" />
          모든 기능을 사용하실 수 있습니다
        </p>
      </h3>
    </>
  );
};

export default React.memo(MobileRefuser);
