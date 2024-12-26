import React, {useEffect, useState} from 'react';
import axios from 'axios';

const useEpilacionServices = (categoryID) => {
    const [serviciosEpilaciones, setserviciosEpilaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchServiciosEpilaciones = async () => {
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
                setserviciosEpilaciones(transformedServices);
            }catch(error){
                console.error('Error fetching servicio corporales:', error);
            }finally{
                setLoading(false);
            }
        };
        fetchServiciosEpilaciones();
    }, [categoryID]);
    return {serviciosEpilaciones, loading};
}

export default useEpilacionServices;