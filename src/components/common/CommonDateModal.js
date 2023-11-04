import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Button } from 'react-bootstrap';
import { logger } from 'util/com';

const CommonDateModal = React.memo(({ modalState, setModalState, onChangeDate }) => {
  //logger.debug('CommonDateModal');

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: '01',
    day: '01',
  });

  useEffect(() => {
    setForm({
      year: new Date().getFullYear(),
      month: '01',
      day: '01',
    });
  }, [modalState]);

  const now = new Date();

  let years = [];
  for (let y = now.getFullYear(); y >= 1930; y -= 1) {
    years.push(y);
  }

  let months = [];
  for (let m = 1; m <= 12; m += 1) {
    if (m < 10) {
      // 날짜가 2자리로 나타나야 했기 때문에 1자리 월에 0을 붙혀준다
      months.push('0' + m.toString());
    } else {
      months.push(m.toString());
    }
  }
  let days = [];
  let date = new Date(form.year, form.month, 0).getDate();
  for (let d = 1; d <= date; d += 1) {
    if (d < 10) {
      // 날짜가 2자리로 나타나야 했기 때문에 1자리 일에 0을 붙혀준다
      days.push('0' + d.toString());
    } else {
      days.push(d.toString());
    }
  }

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal setDateModal">
      <Modal.Header>
        <Modal.Title>주문서 날짜변경</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
          {years.map((item) => (
            <option value={item} key={item}>
              {item} 년
            </option>
          ))}
        </select>

        <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
          {months.map((item) => (
            <option value={item} key={item}>
              {item} 월
            </option>
          ))}
        </select>

        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          {days.map((item) => (
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
            onChangeDate(`${form.year}-${form.month}-${form.day}`);
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
