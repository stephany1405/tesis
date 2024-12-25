import React, {useEffect, useState} from 'react';
import axios from 'axios';

const useCorporalesServices = (categoryID) => {
    const [serviciosCorporales, setserviciosCorporales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchServiciosCorporales = async () => {
            try{
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/api/servicios/categoria/${categoryID}`);

                const transformedServices = response.data.map(item => ({
                    id: item.id,
                    title: item.classification_type,
                    description: item.description,
                    image: item.service_image,
                    price: item.price,
                    time: item.time,
                }));
                setserviciosCorporales(transformedServices);
            }catch(error){
                console.error('Error fetching servicio corporales:', error);
            }finally{
                setLoading(false);
            }
        };
        fetchServiciosCorporales();
    }, [categoryID]);
    return {serviciosCorporales, loading};
}

export default useCorporalesServices;