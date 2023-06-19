import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from 'components/base/Home';
import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Modals from 'components/modal';

import Login from 'components/base/Login';
import Logout from 'components/base/Logout';
import MyPage from 'components/base/MyPage';
import Regist from 'components/base/Regist';
import RegistResult from 'components/base/RegistResult';
import SearchID from 'components/base/SearchID';
import SearchPW from 'components/base/SearchPW';

import { logger } from 'util/com';
import ProtectedRoute from 'components/common/ProtectedRoute';
import Tab1 from 'components/settlement/Tab1';
import Tab2 from 'components/settlement/Tab2';
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
              path="tab1"
              element={
                <ProtectedRoute>
                  <Tab1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="tab2"
              element={
                <ProtectedRoute>
                  <Tab2 />
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

          <Route
            path="mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route path="regist">
            <Route path="" element={<Regist />} />
            <Route path="result" element={<RegistResult />} />
          </Route>

          <Route path="search">
            <Route path="id" element={<SearchID />} />
            <Route path="password" element={<SearchPW />} />
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
