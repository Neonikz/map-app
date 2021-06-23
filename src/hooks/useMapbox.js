import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoibmVvbmlreiIsImEiOiJja3E4ZDF2cGIwYjNjMm9rNzV6emRhMmJmIn0.S-Pi5vZxtVud2d_9N1NJYg';


export const useMapbox = ( initialPoint ) => {

    //Mantener la referencia del contenedor del mapa
    const mapDiv = useRef();
    const setRef = useCallback( (node) => {
        mapDiv.current = node;
    },[]);

    //Referencia a los marcadores
    const markers = useRef({});

    //Observables de Rxjs
    const markerMovement = useRef( new Subject() );
    const newMarker = useRef( new Subject() );

    //Referencia al mapa
    const mapa = useRef();

    //Estado de las coordenadas
    const [coords, setCoords] = useState( initialPoint );

    //Funcion para agregar marcadores
    const addMarker = useCallback( ( ev, id ) => {
        const { lng, lat } = ev.lngLat || ev;
            
        //Creacion del marcador y asignacion del id
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker
            .setLngLat([ lng, lat ])
            .addTo( mapa.current )
            .setDraggable( true );
        
        //Asignamos al objeto los markadores
        markers.current[ marker.id ] = marker;

        //Marcador del observable
        if( !id ){
            newMarker.current.next({
                id: marker.id,
                lng, 
                lat
            });
        }

        //Escuchar movimientos del marcador
        marker.on('drag', ({ target }) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();
            //Movimiento del marcador en el observable
            markerMovement.current.next({ id, lng, lat });
        });

    },[]);

    //Funcion para actualizar la ubicacion del marcador
    const updatePosition = useCallback( ({ id, lng, lat}) => {
        markers.current[ id ].setLngLat([ lng, lat ]);
    },[]);

    //Genera el mapa y su contenedor
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ initialPoint.lng , initialPoint.lat ],
            zoom: initialPoint.zoom
        });

        mapa.current = map;
    }, [ initialPoint ]);

    //Cuando se mueve el mapa
    useEffect(() => {
        
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        });

        return mapa?.current.off('move');

    }, []);

    //Agregar marcadores cuandos se hace click en el mapa
    useEffect(() => {
        mapa.current?.on('click', addMarker );
    }, [ addMarker ]);


    return {
        addMarker,
        coords,
        markers,
        markerMovement$: markerMovement.current,
        newMarker$: newMarker.current,
        updatePosition,
        setRef,
    }
}
