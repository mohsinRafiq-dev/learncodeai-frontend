import { Outlet } from "react-router-dom";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import UpdateBanner from "../components/UpdateBanner/UpdateBanner";

export default function Layout() {
  return (
    <>
      <UpdateBanner />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

