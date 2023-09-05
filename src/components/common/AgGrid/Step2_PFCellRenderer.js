import { useEffect, useState, useRef } from 'react';
import React from 'react';
import Tippy from '@tippyjs/react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import Recoils from 'recoils';
import { replace_1000, revert_1000 } from 'util/com';
import _ from 'lodash';

const PopupCellRenderer = (props) => {
  const tippyRef = useRef();
  const dropdownRef = useRef();
  const inputRef = useRef();
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  let pf_category;
  const packingData = _.cloneDeep(Recoils.getState('DATA:PACKING'));
  if (packingData && packingData.length > 1) {
    pf_category = packingData;
    pf_category.push({ packing_category: '기타', packing_fee: 0 });
  }

  const pf_str = _.map(pf_category, 'packing_category');

  let selectIdx = _.indexOf(pf_str, props.data.packing_descript);
  if (selectIdx < 0) selectIdx = 0;

  const [selectType, setSelectType] = useState(selectIdx);

  useEffect(() => {
    const selectDescript = props.data.packing_descript;
    for (let i = 0; i < pf_category.length; ++i) {
      const pf_category_obj = pf_category[i];
      if (pf_category_obj.packing_category == selectDescript) {
        setSelectType(i);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (pf_category.length != 0 && selectType == pf_category.length - 1) {
      inputRef.current.value = replace_1000(revert_1000(props.data.packing_fee));

      props.data.packing_descript = pf_category[selectType].packing_category;
      return;
    }

    inputRef.current.value = replace_1000(
      revert_1000(pf_category[selectType].packing_fee1 + pf_category[selectType].packing_fee2)
    );
    props.data.packing_descript = pf_category[selectType].packing_category;
    props.data.packing_fee = replace_1000(revert_1000(inputRef.current.value));

    props.onCellValueChanged(props, onRefreshCell);
  }, [selectType]);

  useEffect(() => {
    if (props.rowData) {
      let selectIdx = _.indexOf(pf_str, props.data.packing_descript);
      if (selectIdx < 0) selectIdx = 0;

      setSelectType(selectIdx);
    }
  }, [props.data]);

  const onRefreshCell = (change) => {
    // 이게 원래.. backgroud가 바뀌는게 아니라 글자색이 바뀌어야 하는데..
    // css가 안됩니다ㅠ
    dropdownRef.current.style.backgroundColor = change;
    inputRef.current.style.backgroundColor = change;
  };

  const onChangeInput = () => {
    inputRef.current.value = replace_1000(revert_1000(inputRef.current.value));
    props.data.packing_fee = replace_1000(revert_1000(inputRef.current.value));
    props.onCellValueChanged(props, onRefreshCell);
  };

  const dropDownContent = (
    <>
      {pf_str.map((name, key) => (
        <Dropdown.Item
          key={key}
          eventKey={key}
          onClick={() => {
            setSelectType(key);
            setVisible(false);
          }}
          active={selectType === key}
        >
          {pf_str[key]}
        </Dropdown.Item>
      ))}
    </>
  );

  return (
    <>
      <Tippy
        ref={tippyRef}
        content={dropDownContent}
        visible={visible}
        onClickOutside={hide}
        allowHTML={true}
        arrow={false}
        appendTo={document.body}
        interactive={true}
        placement="bottom"
      >
        <DropdownButton
          ref={dropdownRef}
          style={{ display: 'inline-block' }}
          variant=""
          title={pf_str && pf_str[selectType]}
          onClick={visible ? hide : show}
        ></DropdownButton>
      </Tippy>
      <input
        ref={inputRef}
        onChange={onChangeInput}
        style={{ display: 'inline-block' }}
        disabled={pf_str.length && selectType == pf_str.length - 1 ? false : true}
      ></input>
      <span>원</span>
    </>
  );
};

export default React.memo(PopupCellRenderer);
