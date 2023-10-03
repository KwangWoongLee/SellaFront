import React, { useState, useEffect } from 'react';
import { img_src, logger, time_format_day } from 'util/com';
import moment from 'moment';
import _ from 'lodash';
import DatePicker from 'react-datepicker';

import icon_circle_arrow_down from 'images/icon_circle_arrow_down.svg';
import icon_circle_arrow_up from 'images/icon_circle_arrow_up.svg';

const dateToString = (date) => {
  return (
    date.getFullYear() +
    '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    date.getDate().toString().padStart(2, '0')
  );
};

const CustomDatePicker = ({ setSearchDateString, setSelectedEndDateString, isRangeSearch }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setSearchDateString(dateToString(startDate));
    setSelectedEndDateString(dateToString(endDate));
  }, [startDate, endDate]);

  const CustomInput = ({ value, onClick }) => (
    <div className={''} onClick={onClick}>
      {value}
      {/* {isCalendarOpen ? (
        <img src={`${img_src}${icon_circle_arrow_down}`} />
      ) : (
        <img src={`${img_src}${icon_circle_arrow_up}`} />
      )} */}
    </div>
  );

  return <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} customInput={<CustomInput />} />;
};

export default CustomDatePicker;
