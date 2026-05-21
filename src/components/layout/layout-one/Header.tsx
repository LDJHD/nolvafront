"use client";
import HeaderManu from "./header/HeaderManu";
import HeaderOne from "./header/HeaderOne";
import HeaderTwo from "./header/HeaderTwo";
import FeatureTools from "@/theme/ThemeSwitcher";

function Header() {
  return (
    <>
      <header className="gi-header">
        <FeatureTools />
        <HeaderOne />
        <HeaderTwo />
        <HeaderManu />
      </header>
    </>
  );
}

export default Header;
