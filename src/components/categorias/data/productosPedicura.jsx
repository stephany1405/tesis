import React, {useEffect, useState} from 'react';
import axios from 'axios';

const usePedicuraServices = (categoryID) => {
    const [serviciosPedicura, setserviciosPedicura] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchServiciosPedicura = async () => {
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
                setserviciosPedicura(transformedServices);
            }catch(error){
                console.error('Error fetching servicio pedicura:', error);
            }finally{
                setLoading(false);
            }
        };
        fetchServiciosPedicura();
    }, [categoryID]);
    return {serviciosPedicura, loading};
}

export default usePedicuraServices;