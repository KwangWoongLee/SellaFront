import React, { useState, useEffect } from 'react';

function Checkbox({ checked, checkedItemHandler }) {
  const [bChecked, setChecked] = useState(checked);

  const checkHandler = ({ target }) => {
    setChecked(!bChecked);
    checkedItemHandler(target.checked);
  };

  return (
    <>
      <input type="checkbox" checked={bChecked} onChange={(e) => checkHandler(e)} />
    </>
  );
}

export default Checkbox;
