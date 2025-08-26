// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from 'react';
import type { NextPage } from "next";
import  { SessionProvider } from "next-auth/react";
import Modal from 'react-modal';




type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
Modal.setAppElement('#__next');
export default function App({ Component, pageProps: {session, ...pageProps} }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
    
  );
}