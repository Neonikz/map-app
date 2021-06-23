import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

//Punto inicial del mapa
const initialPoint = {
    lng: -58.4348,
    lat:  -34.8155,
    zoom: 14
}

export const MapPage = () => {

    const { coords, setRef, newMarker$, markerMovement$, addMarker, updatePosition } = useMapbox( initialPoint );

    const { socket } = useContext( SocketContext );

    //Escuchar los marcadores existentes
    useEffect(() => {
        
        socket.on('active-markers', markers =>{

            for (const key of Object.keys( markers )) {               
                addMarker( markers[key], key );
            }

        });

    }, [ socket, addMarker ]);


    //Efecto para cuando añadimos un marcador con el observable
    useEffect(() => {
        newMarker$.subscribe( marker => {
            socket.emit('new-marker', marker);
        });
    }, [ newMarker$, socket ]);

    //Effecto para el movimiento del marcador
    useEffect(() => {
        markerMovement$.subscribe( marker => {
            socket.emit('update-marker', marker);
        });
    }, [socket,markerMovement$]);

    //Mover marcador mediante sockets
    useEffect(() => {
        socket.on('update-marker', marker => {
            updatePosition( marker );
        });
    }, [ socket, updatePosition ]);

    //Escuchar nuevos marcadores
    useEffect(() => {
        socket.on('new-marker', marker => {
            addMarker( marker, marker.id );
        });
    }, [ socket, addMarker ]);

    return (
        <>  

            <div className="coords">
                Lng:{ coords.lng } | Lat: { coords.lat } | Zoom: { coords.zoom }
            </div>
        
            <div
                ref={ setRef } 
                className="mapContainer"
            />

        </>
    )
}
