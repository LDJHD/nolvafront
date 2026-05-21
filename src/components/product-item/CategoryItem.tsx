import Link from "next/link";
import React from "react";

const CategoryItem = ({ data }) => {
  return (
    <div className="gi-cat-icon">
      <i className={data.icon}></i>
      <div className="gi-cat-detail">
        <Link href={`/prestataires?type=${data.slug}`}>
          <h4 className="gi-cat-title">{data.name}</h4>
        </Link>
      </div>
    </div>
  );
};

export default CategoryItem;
