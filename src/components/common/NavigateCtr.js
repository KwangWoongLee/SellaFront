import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from 'util/com';
export const navigate_ref = React.createRef();

const NavigateCtr = () => {
  const navigate = useNavigate();
  const location = useLocation();

  logger.render('NavigateCtr :', location.pathname);

  navigate_ref.current = { navigate, location };

  return null;
};

export default NavigateCtr;
