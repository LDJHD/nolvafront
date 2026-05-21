import { useState } from "react";
import { Col } from "react-bootstrap";
import ItemCard from "./ItemCard";
import Spinner from "../button/Spinner";

interface ProductAllProps {
  data: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  hasPaginate?: boolean;
}

function ProductAll({
  data,
  onSuccess = () => {},
  onError = () => {},
  hasPaginate = false,
}: ProductAllProps) {
  const [selected, setSelected] = useState(false);
  const [cache, setCache] = useState(1);

  const handleClick = () => {
    setSelected(!selected);
  };

  if (!data) return <Spinner />;

  const getData = () => {
    if (hasPaginate) return data.data;
    else return data;
  };

  return (
    <>
      {getData().map((item: any, index: number) => (
        <Col
          key={index}
          md={4}
          className={`col-sm-6 gi-product-box gi-col-5 ${
            selected ? "active" : ""
          }`}
          onClick={handleClick}
        >
          <ItemCard cache={cache} data={item} />
        </Col>
      ))}
    </>
  );
}

export default ProductAll;
