import { useEffect, useState, useRef } from 'react';
import React from 'react';
import Tippy from '@tippyjs/react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import _ from 'lodash';
import { replace_1000, revert_1000 } from 'util/com';
import Recoils from 'recoils';

const NumberCellRenderer = (props) => {
  const inputRef = useRef();

  const onRefreshCell = (change) => {
    inputRef.current.style.backgroundColor = change;
  };

  const onChangeInput = () => {
    inputRef.current.value = replace_1000(revert_1000(inputRef.current.value));
    props.onCellValueChanged(props, onRefreshCell);
  };

  return (
    <>
      <input ref={inputRef} onChange={onChangeInput}></input>
      <span>원</span>
    </>
  );
};

export default React.memo(NumberCellRenderer);
