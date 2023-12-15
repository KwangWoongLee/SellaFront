import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Modal, Button } from 'react-bootstrap';
import { img_src, logger } from 'util/com';

import icon_close from 'images/icon_close.svg';

const CommonDateModal = React.memo(({ modalState, setModalState, onChangeDate }) => {
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const yearsRef = useRef([]);
  const monthsRef = useRef([]);
  const daysRef = useRef([]);

  useEffect(() => {
    const now = Date.now();
    for (let y = new Date(now).getFullYear(); y >= 1930; y -= 1) {
      yearsRef.current.push(y);
    }

    for (let m = 1; m <= 12; m += 1) {
      monthsRef.current.push(m);
      const monthDate = new Date(new Date(now).getFullYear(), m, 0).getDate();
      const monthDays = [];
      for (let d = 1; d <= monthDate; d += 1) {
        monthDays.push(d);
      }
      daysRef.current.push(monthDays);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const nowDate = new Date(now);
    setYear(nowDate.getFullYear());
    setMonth(nowDate.getMonth() + 1);
    setDay(nowDate.getDate());
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal setDateModal">
      <Modal.Header>
        <Modal.Title>주문서 날짜변경</Modal.Title>
        <Button variant="primary" className="btn_close" onClick={onClose}>
          <img alt={''} src={`${img_src}${icon_close}`} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {yearsRef.current &&
            yearsRef.current.map((item) => (
              <option value={item} key={item}>
                {item} 년
              </option>
            ))}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {monthsRef.current &&
            monthsRef.current.map((item) => (
              <option value={item} key={item}>
                {item} 월
              </option>
            ))}
        </select>

        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {daysRef.current[month - 1] &&
            daysRef.current[month - 1].map((item) => (
              <option value={item} key={item}>
                {item} 일
              </option>
            ))}
        </select>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn-primary btn"
          variant="secondary"
          onClick={() => {
            onChangeDate(`${year}-${month > 10 ? month : `0${month}`}-${day > 10 ? day : `0${day}`}`);
            onClose();
          }}
        >
          변경
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
export default CommonDateModal;
