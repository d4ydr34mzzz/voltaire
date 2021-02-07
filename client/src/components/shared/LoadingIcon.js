import React from "react";

function LoadingIcon() {
  return (
    <div className="container text-center">
      <img
        src={require("../../images/loading_icon.gif")}
        className="loading-icon"
        alt="loading"
      />
    </div>
  );
}

export default LoadingIcon;
