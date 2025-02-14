import React, { useState, useEffect } from "react";
import Header from "./header";
import Carrusel from "./carrusel";
import CategoriasList from "./categoriasList";
import { Link } from "react-router-dom";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import styles from "./inicio.module.css";

const photos = [
  { src: "/imagenes/cara(4).jpeg" },
  { src: "/imagenes/cara(3).jpeg" },
  { src: "/imagenes/cara(2).jpeg" },
  { src: "/imagenes/cara(1).jpeg" },
];

const categorias = [
  {
    id: 1,
    name: "Tratamientos faciales",
    imageUrl: "/placeholder.svg",
    link: "/servicios/Facial/",
  },
  {
    id: 2,
    name: "Tratamientos corporales",
    imageUrl: "/placeholder.svg",
    link: "/servicios/corporales",
  },
  {
    id: 3,
    name: "Manicura",
    imageUrl: "/placeholder.svg",
    link: "/servicios/manicura",
  },
  {
    id: 4,
    name: "Extensiones de pestañas",
    imageUrl: "/placeholder.svg",
    link: "/servicios/extension",
  },
  {
    id: 5,
    name: "Pedicura",
    imageUrl: "/placeholder.svg",
    link: "/servicios/pedicura",
  },
  {
    id: 6,
    name: "Quiropodia",
    imageUrl: "/placeholder.svg",
    link: "/servicios/quiropodia",
  },
  {
    id: 7,
    name: "Epilación con cera",
    imageUrl: "/placeholder.svg",
    link: "/servicios/epilacion",
  },
];

const Inicio = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const token = getJWT("token");
  const { id } = jwtDecode(token);
  const userId = id;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/recommendations/${userId}`
      );
      const data = await response.json();
      setRecommendations(data.recommendations);
      setGreeting(data.greeting);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
      setGreeting("¡Bienvenido!");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (showRecommendations) {
      fetchRecommendations();
    }
  }, [showRecommendations]);

  return (
    <>
      <div className={styles.app_container}>
        <div
          className={styles.recommendation_bubble}
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          <div className={styles.bubble_icon}>🤖</div>
        </div>

        {showRecommendations && (
          <div className={styles.recommendation_panel}>
            <h3 className={styles.greeting}>{greeting}</h3>
            <h3>Recomendaciones para ti</h3>

            {isLoading ? (
              <div className={styles.loading_message}>
                Cargando recomendaciones...
              </div>
            ) : (
              <div className={styles.recommendations_list}>
                {recommendations.length > 0 ? (
                  recommendations.map((service) => (
                    <Link
                      key={service.id}
                      className={styles.recommendation_item}
                    >
                      {service.name} - Categoria :{" "}
                      <strong>{service.category_name}</strong>
                    </Link>
                  ))
                ) : (
                  <div className={styles.no_recommendations}>
                    <h3 className={styles.greeting}>{greeting}</h3>
                    Basado en tus preferencias, te recomendamos:
                    {categorias.slice(0, 3).map((cat) => (
                      <div
                        key={cat.id}
                        className={styles.popular_service_no_link}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.carousel_container}>
          <Carrusel images={photos} autoPlayInterval={6000} />
        </div>

        <div className={styles.categories_container}>
          <CategoriasList categorias={categorias} />
        </div>
      </div>
    </>
  );
};

export default Inicio;
