import React, {useEffect, useState} from 'react';
import axios from 'axios';

const useManiServices = (categoryID) => {
    const [serviciosManicura, setServiciosManicura] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchServiciosManicura = async () => {
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
                setServiciosManicura(transformedServices);
            }catch(error){
                console.error('Error fetching servicio manicura:', error);
            }finally{
                setLoading(false);
            }
        };
        fetchServiciosManicura();
    }, [categoryID]);
    return {serviciosManicura, loading};
}

export default useManiServices;