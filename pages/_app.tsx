// // pages/_app.tsx
// import "@/styles/globals.css";
// import type { AppProps } from "next/app";
// import { ReactElement, ReactNode } from 'react';
// import type { NextPage } from "next";
// import  { SessionProvider } from "next-auth/react";
// import Modal from 'react-modal';
// import  { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';



// type NextPageWithLayout = NextPage & {
//   getLayout?: (page: ReactElement) => ReactNode;
// };

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout;
// };
// Modal.setAppElement('#__next');
// export default function App({ Component, pageProps: {session, ...pageProps} }: AppPropsWithLayout) {
//   const getLayout = Component.getLayout ?? ((page) => page);

//   return (
//     <SessionProvider session={session}>
//       {getLayout(<Component {...pageProps} />)}
//       <ToastContainer />
//     </SessionProvider>
    
//   );
// }

// pages/_app.tsx

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"; // 1. Import SessionProvider
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';

// This is the TypeScript type for pages that have a layout
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // 2. Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    // 3. Wrap the entire application with SessionProvider
    <SessionProvider session={pageProps.session}>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}