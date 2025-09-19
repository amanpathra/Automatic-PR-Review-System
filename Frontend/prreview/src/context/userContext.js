// Context.js
import React, { createContext, useState } from 'react';

// Create a new context
export const UserContext = createContext();

// Create a provider component
export const MyProvider = ({ children }) => {

    const [accessToken, setAccessToken] = useState("");
    const [username, setUsername] = useState("");

    return (
        <UserContext.Provider value={{ accessToken, setAccessToken, username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
};