import React, { useState, useEffect } from 'react';

import FlipImage from '../images/swap_vert_grey800_24dp.png';

import '../css/elements.css';

export function IconPlaceHolder() {
  return (
    <>
      <div className="iconContainer">
        <div className="iconplaceholder"></div>
      </div>
    </>
  );
}

export function FlipIcon({ state }) {
  const [toggle, setToggle] = useState(state);

  useEffect(() => {
    setToggle(state);
  }, [state]);

  return <img src={FlipImage} className={`flipIcon ${toggle ? 'flip' : ''}`} width={28} height={28} />;
}

export function SearchIcon(isIdle) {
  const elm = document.createElement('div');
  elm.className = 'searchIndicator';
  elm.innerHTML = `
    <button id="search">
      <img
        class="icon ${isIdle ? '' : 'hidden'}"
        alt="Search"
        src="/img/search-svgrepo-com.svg"
      ></img>
    </button>
    <img
      class="icon ${isIdle ? 'hidden' : ''}"
      alt="Looking up..."
      loading="lazy"
      decoding="async"
      data-nimg="1"
      src="/img/spin.svg"
    ></img>
  `;
  return elm;
}