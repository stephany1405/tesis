import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCheckout } from "./hooks/useCheckout";
import styles from "../bolsa/bolsa.module.css";

export const CheckOutForm = ({
  total,
  cartItems,
  selectedItems,
  resetCart,
  selectedAppointment,
  addressAppointment,
  appointmentCoordinates
}) => {
  const { handleSubmit, loading, error } = useCheckout(
    total,
    cartItems,
    selectedItems,
    resetCart,
    selectedAppointment,
    addressAppointment,
    appointmentCoordinates 
  );

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.cardElementContainer}>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" className={styles.paymentButton} disabled={loading}>
        {loading ? <span className={styles.loader}></span> : "Pagar"}
      </button>
    </form>
  );
};
