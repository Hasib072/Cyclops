// frontend/src/components/Loader.jsx

import React from 'react';
import './Loader.css'; // Import the CSS for the loader

const Loader = () => {
  return (
   <div  className="loader-overlay">
   <div className="banter-loader">
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
     <div className="banter-loader__box"></div>
   </div>
   </div>
  );
};

export default Loader;
