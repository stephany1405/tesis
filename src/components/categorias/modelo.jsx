import styles from './modelo.module.css'
import Header from '../inicio/header'

const ProductCard = ({ product }) => (
  <div key={product.id} className={styles.card}>
    <div className={styles.header} />
    <h3 className={styles.productTitle}>{product.title}</h3>
    <p className={styles.description}>{product.description}</p>
    <div className={styles.price}>${product.price}</div>
    <button className={styles.addButton}>+</button>
  </div>
);

const Modelo = ({ title, products }) => {
  const groupedProducts = products.some(item => item.title && Array.isArray(item.products));

  return (
    <>
      <div>
        <Header />
      </div>
      <h1 className={styles.title}>{title}</h1>
      {groupedProducts ? (
        products.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.title && <h2 className={styles.groupTitle}>{group.title}</h2>}
            <div className={styles.container}>
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.container}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};
 export default Modelo;

