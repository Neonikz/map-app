import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';

//Hook para manejo de las conexiones del socket
export const useSocket = ( serverPath ) => {

    //Se conecta al server socket del backend
    const socket = useMemo(() => io.connect( serverPath , {
        transports: ['websocket'] 
    }) , [ serverPath ]); 

    //State para cambiar entre online y offline
    const [online, setOnline] = useState(false);

    //Efectos para cuando se conecta o desconecta
    useEffect(() => {
        setOnline( socket.connected )
    }, [ socket ]);


    useEffect(() => {
        
        socket.on('connect', () => {
            setOnline( true );
        });

    }, [ socket ]);

    useEffect(() => {
        
        socket.on('disconnect', () => {
            setOnline( false );
        });

    }, [ socket ]);

    return {
        socket,
        online
    }

}