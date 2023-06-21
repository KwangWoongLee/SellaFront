import React, { useState } from 'react';

function Checkbox() {
  const [checked, setChecked] = useState(false);
  const handleChange = () => {
    setChecked(!checked); 
  };

  return (
    <div>
      <input type={'checkbox'} defaultChecked={checked} onChange={handleChange}></input>
    </div>
  );
}

export default Checkbox;
