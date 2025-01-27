import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modelo from "./modelo";
import axios from "axios";

const DynamicCategory = () => {
  const { categoryID } = useParams();
  const [services, setServices] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryServices = async () => {
      try {
        setLoading(true);

        const categoriesResponse = await axios.get(
          `http://localhost:3000/api/servicios/categoria`
        );

        const currentCategory = categoriesResponse.data.find(
          (category) => category.id === categoryID
        );

        if (currentCategory) {
          setCategoryTitle(currentCategory.classification_type);
        }

        const servicesResponse = await axios.get(
          `http://localhost:3000/api/servicios/categoria/${categoryID}`
        );

        const transformedServices = servicesResponse.data.map((item) => ({
          id: item.id,
          title: item.classification_type,
          description: item.description,
          image: item.service_image,
          price: item.price,
          time: item.time,
        }));

        setServices(transformedServices);
      } catch (error) {
        console.error("Error fetching category services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryServices();
  }, [categoryID]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title={`Servicios ${categoryTitle}`} products={services} />
    </>
  );
};

export default DynamicCategory;
