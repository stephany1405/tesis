import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modelo from "./modelo";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import styles from"./dinamycCategory.module.css";
const DynamicCategory = () => {
  const { categoryID } = useParams();
  const [services, setServices] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [noServices, setNoServices] = useState(false);

  useEffect(() => {
    const fetchCategoryServices = async () => {
      try {
        setLoading(true);
        setNoServices(false);
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

        if (
          (servicesResponse.data.message &&
            servicesResponse.data.message ===
              "No se encontraron servicios para esta categoría.") ||
          (Array.isArray(servicesResponse.data) &&
            servicesResponse.data.length === 0)
        ) {
          console.log("No hay servicios disponibles. Actualizando estado...");
          setNoServices(false); 
          setTimeout(() => {
            setNoServices(true);
          }, 0);
          setServices([]);
        } else if (Array.isArray(servicesResponse.data)) {
          const transformedServices = servicesResponse.data.map((item) => ({
            id: item.id,
            title: item.classification_type,
            description: item.description,
            image: item.service_image,
            price: item.price,
            time: item.time,
          }));
          setServices(transformedServices);
        } else {
          setNoServices(true);
          setServices([]);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setNoServices(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryServices();
  }, [categoryID]);

  console.log("Estado actual:", { loading, noServices, services });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Servicios {categoryTitle}</h1>
      {noServices ? (
        <div className={styles.noservicesmessage}>
          <AlertCircle className={styles.alerticon} />
          <p className={styles.noservicestext}>
            No hay servicios disponibles para esta categoría.
          </p>
          <p className={styles.noservicessubtext}>
            Por favor, intenta con otra categoría o vuelve más tarde.
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className={styles.loadingspinner}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <Modelo title={`Servicios ${categoryTitle}`} products={services} />
      )}
    </div>
  );
};
export default DynamicCategory;
