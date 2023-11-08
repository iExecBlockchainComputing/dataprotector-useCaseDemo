import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@iexec/react-ui-kit';
import {
  Navigation,
  NewProtectedData,
  MyProtectedData,
  OneProtectedData,
  EmailDapp,
  SendEmail,
  LoginGuard,
} from './features';
import {
  PROTECTED_DATA,
  CONSENT,
  SEND_EMAIL,
  CREATE,
  HOME,
} from './config/path';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Navigation />
        <div className="mx-auto mt-12 w-[70%]">
          <Routes>
            <Route
              path={`/${PROTECTED_DATA}`}
              element={
                <LoginGuard>
                  <MyProtectedData />
                </LoginGuard>
              }
            />
            <Route
              path={`/${PROTECTED_DATA}/${CONSENT}/:ProtectedDataId`}
              element={
                <LoginGuard>
                  <OneProtectedData />
                </LoginGuard>
              }
            />
            <Route
              path={`/${PROTECTED_DATA}/${CREATE}`}
              element={
                <LoginGuard>
                  <NewProtectedData />
                </LoginGuard>
              }
            />
            <Route
              path={`/${SEND_EMAIL}`}
              element={
                <LoginGuard>
                  <EmailDapp />
                </LoginGuard>
              }
            />
            <Route
              path={`/${SEND_EMAIL}/:receiverAddress/:protectedDataAddress`}
              element={
                <LoginGuard>
                  <SendEmail />
                </LoginGuard>
              }
            />
            {/* default redirect */}
            <Route path="*" element={<Navigate to={`/${HOME}`} />} />
          </Routes>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
