import React, {useEffect, useState} from 'react';
import axios from 'axios';

const useExtensionesServices = (categoryID) => {
    const [serviciosExtensiones, setserviciosExtensiones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchServiciosExtensiones = async () => {
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
                setserviciosExtensiones(transformedServices);
            }catch(error){
                console.error('Error fetching servicio corporales:', error);
            }finally{
                setLoading(false);
            }
        };
        fetchServiciosExtensiones();
    }, [categoryID]);
    return {serviciosExtensiones, loading};
}

export default useExtensionesServices;