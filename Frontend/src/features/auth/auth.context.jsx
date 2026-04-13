import { useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { AuthContext } from "./auth.context.js";

export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let ignore = false

        const loadCurrentUser = async () => {
            try {
                const data = await getMe()

                if (!ignore) {
                    setUser(data?.user ?? null)
                }
            } catch {
                if (!ignore) {
                    setUser(null)
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadCurrentUser()

        return () => {
            ignore = true
        }
    }, [])


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}
