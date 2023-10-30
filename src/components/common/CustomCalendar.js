import React, { useState, useEffect } from 'react';
import { logger, time_format_day } from 'util/com';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import _ from 'lodash';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => {
  return (
    <div className={event.className}>
      {_.split(event.title, '\n').map((d, key) => {
        return (
          <>
            {d}
            <br></br>
          </>
        );
      })}
    </div>
    // <div>
    //   <div style={{ marginTop: 4, marginBottom: 4, overflow: 'hidden' }}>
    //     <div style={{ fontWeight: 500, float: 'left' }}>
    //       <div>{event.title > 0 ? '이익' : '손해'}</div>
    //       {event.title}
    //     </div>
    //   </div>
    // </div>
  );
};

const CustomCalendar = ({ dayGroupDatas, selectCallback, setCalendarCurrentDate }) => {
  //logger.debug('CustomCalendar');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!_.isEmpty(dayGroupDatas)) {
      setEvents(_.values(dayGroupDatas));
    }
  }, [dayGroupDatas]);

  useEffect(() => {
    if (setCalendarCurrentDate) {
      setCalendarCurrentDate(currentDate);
    }
  }, [currentDate]);

  return (
    <>
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        views={['month']}
        components={{
          event: CustomEvent,
        }}
        events={events}
        style={{ height: '100vh' }}
        onSelectEvent={(e) => {
          selectCallback(e);
        }}
        onNavigate={(date) => {
          setCurrentDate(date);
        }}
        selectable={true}
        messages={{
          today: '오늘',
          next: '다음 달',
          previous: '이전 달',
        }}
      />
    </>
  );
};

export default CustomCalendar;
