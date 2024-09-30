import React from 'react';
import Popup from 'reactjs-popup';

export default function PopupInfo({ info, icon }) {
  const ArrowStyle = {
    color: '#4caf50'
  };

  return (
    <div className="infoPopUpContainer">
      <Popup
        trigger={
          <div className="popInfo">{icon}</div>
        }
        position="bottom center"
        arrow={true}
        arrowStyle={ArrowStyle}
        offsetX={10}
        on="hover"
      >
        <div className="contentInfo">
          {info}
        </div>
      </Popup>
    </div>
  );
}
