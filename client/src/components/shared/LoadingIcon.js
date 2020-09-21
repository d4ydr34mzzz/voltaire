import React from "react";

function LoadingIcon() {
  return (
    <div className="container text-center">
      <img src={require("../../images/loading_icon.gif")} alt="loading" />
    </div>
  );
}

export default LoadingIcon;
