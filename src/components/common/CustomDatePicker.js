import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { time_format_day } from 'util/com';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
const CustomDatePicker = ({ setDateCallback }) => {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      view={false}
      selected={startDate}
      onChange={(date) => {
        setStartDate(date);

        if (setDateCallback) setDateCallback(date);
      }}
    />
  );
};

export default CustomDatePicker;
