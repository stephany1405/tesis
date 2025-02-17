import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DesplegableC } from "./desplegableC";
import axios from "axios";
import styles from "./Header.module.css";
import Cookies from "js-cookie";
import { useCart } from "./useContext";

const Header = () => {
  const [showServices, setShowServices] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { resetCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/usuario/logout"
      );
      if (response.status === 200) {
        localStorage.clear();
        resetCart();
        Cookies.remove("token", { path: "/" });
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/");
      } else {
        console.error("Error al cerrar sesión:", response.data);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/servicios/categoria"
      );
      const transformedCategorias = response.data.map((category) => ({
        id: category.id,
        name: category.classification_type,
        link: `/servicios/${category.classification_type.toLowerCase()}/${
          category.id
        }`,
      }));
      setCategorias(transformedCategorias);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []); //Fixed: Added empty dependency array to useEffect

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/inicio" className={styles.logo}>
          uñimas
        </Link>
        <button className={styles.menuToggle} onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.menuOpen : ""}`}>
          <Link
            to="/inicio"
            className={styles.navLink}
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/agenda"
            className={styles.navLink}
            onClick={() => setMenuOpen(false)}
          >
            Agenda
          </Link>
          <div
            className={styles.servicesDropdown}
            onClick={() => setShowServices(!showServices)}
          >
            <button className={styles.navLink}>Servicios</button>
            {showServices && (
              <ul className={styles.dropdownMenu}>
                {categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <Link
                      to={categoria.link}
                      onClick={() => setMenuOpen(false)}
                    >
                      {categoria.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DesplegableC />
          <Link
            to="/perfil"
            className={styles.navLink}
            onClick={() => setMenuOpen(false)}
          >
            Perfil
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
