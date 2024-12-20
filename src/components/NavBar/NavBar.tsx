import { useUserStore } from '@/stores/user.store.ts';
import '@fontsource/space-mono/700.css';
import { useState, useEffect, useRef } from 'react';
import { LogOut } from 'react-feather';
import { NavLink, useLocation } from 'react-router-dom';
import iExecLogo from '@/assets/iexec-logo.svg';
import AddressChip from '@/components/NavBar/AddressChip.tsx';
import { useLoginLogout } from '@/components/NavBar/useLoginLogout.ts';
import { Button } from '@/components/ui/button.tsx';

const activeLinkIndicatorWidthRatio = 0.7;

export default function NavBar() {
  const location = useLocation();

  const { isConnected, address } = useUserStore();
  const { login, logout } = useLoginLogout();

  const [tabIndicatorLeft, setTabIndicatorLeft] = useState('');
  const [tabIndicatorWidth, setTabIndicatorWidth] = useState('');

  const navLinks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navLinks.current) {
      return;
    }
    const activeLink = navLinks.current.getElementsByClassName(
      'active'
    )[0] as HTMLAnchorElement | null;
    if (!activeLink) {
      return;
    }
    const activeLinkWidth = activeLink.clientWidth;
    const indicatorLeft =
      (activeLinkWidth - activeLinkIndicatorWidthRatio * activeLinkWidth) / 2;
    setTabIndicatorWidth(
      activeLinkIndicatorWidthRatio * activeLinkWidth + 'px'
    );
    setTabIndicatorLeft(activeLink.offsetLeft + indicatorLeft + 'px');
  }, [location]);

  return (
    <header className="dark flex h-[64px] items-center bg-grey-900 px-8 text-white">
      <NavLink
        to={`/protectedData`}
        className="-mx-2 flex h-full items-center p-2"
      >
        <img src={iExecLogo} width="25" height="30" alt="iExec logo" />

        <div
          className="ml-3 font-bold leading-5"
          style={{ fontFamily: 'Space Mono' }}
        >
          iExec
        </div>
      </NavLink>

      <div
        ref={navLinks}
        className="relative ml-20 flex h-full items-center gap-x-8 pr-2 text-base"
      >
        <NavLink
          to={`/protectedData`}
          className="-mx-2 flex h-full items-center p-2"
        >
          My Protected Data
        </NavLink>
        <NavLink
          to={`/sendEmail`}
          className="-mx-2 flex h-full items-center p-2"
        >
          Send Email
        </NavLink>
        <NavLink
          to={`/sendTelegram`}
          className="-mx-2 flex h-full items-center p-2"
        >
          Send Telegram
        </NavLink>
        <div
          className="absolute bottom-0 h-1 rounded-md bg-white transition-all duration-300"
          style={{ width: tabIndicatorWidth, left: tabIndicatorLeft }}
        ></div>
      </div>

      {isConnected ? (
        <div className="flex flex-1 items-center justify-end gap-x-1">
          <AddressChip address={address!} />
          <button
            type="button"
            className="-mr-2 bg-grey-900 p-2"
            onClick={() => logout()}
          >
            <LogOut size="20" />
          </button>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-end">
          {/* w-[98px] = Match what's in react ui kit */}
          <Button
            size="sm"
            className="w-[98px]"
            onClick={() => {
              login();
            }}
          >
            Login
          </Button>
        </div>
      )}
    </header>
  );
}
