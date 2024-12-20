import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from '@/components/NavBar/NavBar.tsx';
import LoginGuard from '@/features/loginGuard/LoginGuard.tsx';
import MyProtectedData from '@/features/myProtectedData/MyProtectedData.tsx';
import CreateProtectedData from '@/features/myProtectedData/createProtectedData/CreateProtectedData.tsx';
import OneProtectedData from '@/features/myProtectedData/oneProtectedData/OneProtectedData.tsx';
import MyEmailContacts from '@/features/sendEmail/MyEmailContacts.tsx';
import SendEmailForm from '@/features/sendEmail/SendEmailForm.tsx';
import MyTelegramContacts from '@/features/sendTelegram/MyTelegramContacts.tsx';
import SendTelegramForm from '@/features/sendTelegram/SendTelegramForm.tsx';
import { useWatchWagmiAccount } from '@/utils/watchWagmiAccount.ts';

function App() {
  useWatchWagmiAccount();

  return (
    <div className="App">
      <NavBar />
      <div className="mx-auto mt-12 w-[80%] max-w-6xl">
        <Routes>
          <Route
            path="protectedData"
            element={
              <LoginGuard>
                <MyProtectedData />
              </LoginGuard>
            }
          />
          <Route
            path="/protectedData/consent/:protectedDataAddress"
            element={
              <LoginGuard>
                <OneProtectedData />
              </LoginGuard>
            }
          />
          <Route
            path="/protectedData/create"
            element={
              <LoginGuard>
                <CreateProtectedData />
              </LoginGuard>
            }
          />
          <Route
            path="sendEmail"
            element={
              <LoginGuard>
                <MyEmailContacts />
              </LoginGuard>
            }
          />
          <Route
            path="/sendEmail/:receiverAddress/:protectedDataAddress"
            element={
              <LoginGuard>
                <SendEmailForm />
              </LoginGuard>
            }
          />
          <Route
            path="sendTelegram"
            element={
              <LoginGuard>
                <MyTelegramContacts />
              </LoginGuard>
            }
          />
          <Route
            path="/sendTelegram/:receiverAddress/:protectedDataAddress"
            element={
              <LoginGuard>
                <SendTelegramForm />
              </LoginGuard>
            }
          />
          {/* default redirect */}
          <Route path="*" element={<Navigate to="protectedData" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
