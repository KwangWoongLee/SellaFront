import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Modal, Button } from 'react-bootstrap';
import { logger } from 'util/com';

const CommonDateModal = React.memo(({ modalState, setModalState, onChangeDate }) => {
  //logger.debug('CommonDateModal');

  const [form, setForm] = useState({});
  const yearsRef = useRef([]);
  const monthsRef = useRef([]);
  const daysRef = useRef([]);

  useEffect(() => {
    const now = Date.now();
    for (let y = new Date(now).getFullYear(); y >= 1930; y -= 1) {
      yearsRef.current.push(y);
    }

    for (let m = 1; m <= 12; m += 1) {
      monthsRef.current.push(m.toString());
    }

    let date = new Date(form.year, form.month, 0).getDate();
    for (let d = 1; d <= date; d += 1) {
      daysRef.current.push(d.toString());
    }

    const nowDate = new Date(now);
    const formData = {
      year: nowDate.getFullYear(),
      month: nowDate.getMonth() + 1,
      day: nowDate.getDate(),
    };
    setForm({
      ...formData,
    });
  }, [modalState]);

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal setDateModal">
      <Modal.Header>
        <Modal.Title>주문서 날짜변경</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
          {yearsRef.current.map((item) => (
            <option value={item} key={item}>
              {item} 년
            </option>
          ))}
        </select>

        <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
          {monthsRef.current.map((item) => (
            <option value={item} key={item}>
              {item} 월
            </option>
          ))}
        </select>

        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          {daysRef.current.map((item) => (
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
            onChangeDate(
              `${form.year}-${form.month > 10 ? form.month : `0${form.month}`}-${
                form.day > 10 ? form.day : `0${form.day}`
              }`
            );
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
