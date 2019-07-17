import * as React from "react";
import { Link } from "gatsby";

export default ({ data }) => {
  return (
    <div>
      <Link to="/character/1">character</Link>
      <Link to="/search">Search View</Link>
    </div>
  );
};
