import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
// import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${import.meta.env.VITE_backend_URL}/users`
})


export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState({});

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity");
            return request.data
        } catch (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

    const data = {
        userData, 
        setUserData, 
        addToUserHistory, 
        getHistoryOfUser,
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}