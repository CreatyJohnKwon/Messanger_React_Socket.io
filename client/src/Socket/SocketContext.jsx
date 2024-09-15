// SocketContext.js
import React, { createContext, useContext } from 'react';
import socket from './socket'; // socket.js 파일 경로를 적절히 수정하세요

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};