import * as React from "react";
import { Link } from "gatsby";

export default ({ data }) => {
  return (
    <div>
      <Link to="/search">Search View</Link>
      <Link to="/layeranatomy">Layer Anatomy</Link>
    </div>
  );
};
