import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logoImp.png";
import { IoMdSearch } from "react-icons/io";
import {
  FaCartPlus,
  FaUser,
  FaBars,
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";
import DarkMode from "./DarkMode";
import { useSelector } from "react-redux";

const Menu = [
  { id: 0, name: "Our Collection", link: "/ourCollection" },
  {
    id: 1,
    name: "Furniture",
    link: "/furniture",
    subMenu: [
      { name: "All", link: "/furniture" },
      { name: "Side Tables", link: "/furniture/side-table" },
      { name: "Coffee Tables", link: "/furniture/coffee-table" },
    ],
  },
  {
    id: 2,
    name: "Home Decor",
    link: "/decor",
    subMenu: [
      { name: "All", link: "/decor" },
      { name: "Candle Holders", link: "/decor/candledecor" },
      { name: "Object Decor", link: "/decor/objectDecor" },
    ],
  },
  { id: 3, name: "Serveware", link: "/servewares" },
  { id: 4, name: "Planters & Vases", link: "/plantersandvases" },
  { id: 5, name: "Our Story", link: "/ourStory" },
  { id: 6, name: "Contact Us", link: "/contactUs" },
  { id: 7, name: "B2B", link: "/b2b" },
];

const changingTexts = [
  "Free Shipping",
  "Sign Up for Exclusive Offers",
  "COD Available",
  "Hassle Free Return & Exchange"
];

const Navbar = ({ handleOrderPopup }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const isLoggedIn = !!userInfo;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) =>
        prevIndex === changingTexts.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (link) => {
    navigate(link);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-black dark:bg-black dark:text-white">
      <div className="bg-black py-2 text-center text-white text-xl font-roboto font-normal">
        <p>{changingTexts[currentTextIndex]}</p>
      </div>

      <div className="shadow-md duration-200">
        <div
          className="bg-black py-2 flex items-center justify-between"
          style={{ height: "70px" }}
        >
          <div className="container flex justify-between items-center relative mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <IoMdSearch
                  className="text-white text-2xl cursor-pointer hover:text-golden-yellow transition-all duration-200"
                  onClick={() => setSearchOpen(!searchOpen)}
                />
                {searchOpen && (
                  <input
                    type="text"
                    placeholder="Search..."
                    className="absolute top-8 left-0 w-[200px] sm:w-[250px] rounded-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary dark:border-gray-500 dark:bg-gray-800"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center absolute inset-x-0 mx-auto">
              <a
                onClick={() => handleNavigation("/")}
                className="font-bold text-2xl sm:text-3xl flex items-center cursor-pointer"
              >
                <img
                  src={Logo}
                  alt="Logo"
                  className="drop-shadow-lg"
                  style={{
                    height: "50px",
                    width: "auto",
                    transition: "transform 0.3s ease",
                  }}
                />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation("/cart")}
                className="bg-gradient-to-r from-golden-yellow to-golden-orange transition-all duration-200 text-white py-1 px-4 rounded-full flex items-center gap-3 group"
              >
                <span className="group-hover:block hidden transition-all duration-200">
                  Order
                </span>
                <FaCartPlus className="text-xl text-white drop-shadow-sm cursor-pointer" />
              </button>

              <button
                onClick={handleProfileClick}
                className="text-white transition-all duration-200 py-1 px-4 rounded-full flex items-center gap-3 group"
              >
                {isLoggedIn ? (
                  <FaUserCircle className="text-xl drop-shadow-sm cursor-pointer" />
                ) : (
                  <FaUser className="text-xl drop-shadow-sm cursor-pointer" />
                )}
                <span>{isLoggedIn ? "" : ""}</span>
              </button>

              <div>
                <DarkMode />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white flex justify-center p-2 sm:p-0">
          <ul className="sm:flex hidden items-center gap-4">
            {Menu.map((data) => (
              <li
                key={data.id}
                className={`relative group ${
                  data.subMenu ? "hover:bg-gray-100" : ""
                }`}
                onMouseEnter={() => data.subMenu && setActiveDropdown(data.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
               <a
                  onClick={() => !data.subMenu && handleNavigation(data.link)}
                  className="inline-block px-4 text-black text-2xl font-roboto relative cursor-pointer transform transition-transform hover:scale-105 flex items-center"
                >
                  {data.name}
                </a>
                {data.subMenu && activeDropdown === data.id && (
                  <ul
                    className="absolute bg-white shadow-lg rounded-lg top-full  w-40"
                    onMouseEnter={() => setActiveDropdown(data.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {data.subMenu.map((subItem, index) => (
                      <li key={index} className="hover:bg-gray-200">
                        <a
                          onClick={() => handleNavigation(subItem.link)}
                          className="block px-4 py-2 text-black hover:text-golden-yellow duration-200 text-base font-roboto"
                        >
                          {subItem.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="sm:hidden flex items-center">
            <button
              className="text-black focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FaBars className="text-2xl" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="bg-white sm:hidden flex flex-col items-start p-4 shadow-md">
            {Menu.map((data) => (
              <div key={data.id}>
                <a
                  onClick={() =>
                    data.subMenu
                      ? toggleDropdown(data.id)
                      : handleNavigation(data.link)
                  }
                  className="block w-full py-2 text-black duration-200 cursor-pointer transform transition-transform hover:scale-105 relative flex justify-between items-center text-base font-roboto"
                >
                  {data.name}
                  {data.subMenu && (
                    <FaChevronDown
                      className={`ml-2 transition-transform ${
                        activeDropdown === data.id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </a>
                {data.subMenu && activeDropdown === data.id && (
                  <ul className="flex flex-col ml-4 mt-1">
                    {data.subMenu.map((subItem, index) => (
                      <li key={index} className="hover:bg-gray-200">
                        <a
                          onClick={() => handleNavigation(subItem.link)}
                          className="block px-4 py-2 text-black duration-200 text-base font-roboto"
                        >
                          {subItem.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
