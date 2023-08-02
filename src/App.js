import React, { useEffect } from 'react';
import 'styles/reset_202305.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/font.scss';
import 'styles/common_202305.scss';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'styles/aggrid_custom.css';
import 'styles/table_custom.css';

import Home from 'components/base/Home';
import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Modals from 'components/modal';

import Login from 'components/base/Login';
import Logout from 'components/base/Logout';
import Membership from 'components/base/Membership';
import Profile from 'components/base/Profile';
import Regist from 'components/base/Regist';
import RegistResult from 'components/base/RegistResult';
import SearchID from 'components/base/SearchID';
import SearchPW from 'components/base/SearchPW';
import SearchIDResult from 'components/base/SearchIDResult';
import SearchPWResult from 'components/base/SearchPWResult';

import { logger } from 'util/com';
import ProtectedRoute from 'components/common/ProtectedRoute';
import MarginCalc from 'components/settlement/MarginCalc';
import TodaySummary from 'components/settlement/TodaySummary';
import FormManagement from 'components/settlement/FormManagement';
import SaleProduct from 'components/settlement/SaleProduct';
import StandardProduct from 'components/settlement/StandardProduct';
import Step1 from 'components/project/Step1';
import Step2 from 'components/project/Step2';

import NavigateCtr from 'components/common/NavigateCtr';
import Margin from 'components/calculator/Margin';
import Buying from 'components/calculator/Buying';
import CSCenter from 'components/cscenter/CSCenter';
import Announcement from 'components/cscenter/Announcement';
import Manual from 'components/cscenter/Manual';
import FAQ from 'components/cscenter/FAQ';
import Inquiry from 'components/cscenter/Inquiry';

//const Router = process.env.REACT_APP_SSR === '1' ? BrowserRouter : HashRouter;

export function App() {
  logger.render('App');
  useEffect(() => {
    logger.debug('mount App');
  }, []);
  return (
    <RecoilRoot>
      <BrowserRouter>
        <RecoilNexus />
        <NavigateCtr />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="settlement">
            <Route
              path="margin_calc"
              element={
                <ProtectedRoute>
                  <MarginCalc />
                </ProtectedRoute>
              }
            />
            <Route
              path="today_summary"
              element={
                <ProtectedRoute>
                  <TodaySummary />
                </ProtectedRoute>
              }
            />
            <Route
              path=""
              element={
                <ProtectedRoute>
                  <TodaySummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="form_management"
              element={
                <ProtectedRoute>
                  <FormManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="sale_product"
              element={
                <ProtectedRoute>
                  <SaleProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="standard_product"
              element={
                <ProtectedRoute>
                  <StandardProduct />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="step1"
            element={
              <ProtectedRoute>
                <Step1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="step2"
            element={
              <ProtectedRoute>
                <Step2 />
              </ProtectedRoute>
            }
          />
          <Route path="calculator">
            <Route
              path="margin"
              element={
                <ProtectedRoute>
                  <Margin />
                </ProtectedRoute>
              }
            />
            <Route
              path="buying"
              element={
                <ProtectedRoute>
                  <Buying />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="cscenter">
            <Route path="" element={<CSCenter />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="manual" element={<Manual />} />
            <Route path="faq" element={<FAQ />} />
            <Route
              path="inquiry"
              element={
                <ProtectedRoute>
                  <Inquiry />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="mypage">
            <Route
              path="membership"
              element={
                <ProtectedRoute>
                  <Membership />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="regist">
            <Route path="" element={<Regist />} />
            <Route path="result" element={<RegistResult />} />
          </Route>

          <Route path="search">
            <Route path="id">
              <Route path="" element={<SearchID />} />
              <Route path="result" element={<SearchIDResult />} />
            </Route>
            <Route path="password">
              <Route path="" element={<SearchPW />} />
              <Route path="result" element={<SearchPWResult />} />
            </Route>
          </Route>

          <Route path="*" element={<h1>Not Found Page</h1>} />
          <Route path="empty" element={null} />
        </Routes>
        <Modals />
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
