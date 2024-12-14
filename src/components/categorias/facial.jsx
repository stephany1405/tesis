import styles from './facial.module.css'
import Header from '../inicio/header'

const products = [
  {
    id: 1,
    title: "Product title",
    description: "Product description and details",
    price: 499.49
  },
  {
    id: 2,
    title: "Premium item",
    description: "High quality product with amazing features",
    price: 599.99
  },
  {
    id: 3,
    title: "Special edition",
    description: "Limited time offer with exclusive benefits",
    price: 799.99
  },
  {
    id: 4,
    title: "Basic package",
    description: "Essential features for everyday use",
    price: 299.99
  },
  {
    id: 5,
    title: "Pro bundle",
    description: "Complete solution for professionals",
    price: 899.99
  }
]

export default function ProductCards() {
  return (
    <>
    <div> <Header/> </div>
    <h1 className={styles.title}>Tratamientos Faciales</h1>
    <div className={styles.container} >
      {products.map((product) => (
        <div key={product.id} className={styles.card}>
          <div className={styles.header} />
          <h2 className={styles.title}>{product.title}</h2>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.price}>${product.price}</div>
          <button className={styles.addButton}>+</button>
        </div>
      ))}
    </div>
    </>
  )
}

