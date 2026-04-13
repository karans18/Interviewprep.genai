import { useContext } from "react";
import { AuthContext } from "../auth.context.js";
import { getMe, login, register, logout } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context

    const syncUserFromSession = async () => {
        const session = await getMe()
        const nextUser = session?.user ?? null

        setUser(nextUser)

        return nextUser
    }

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            const authenticatedUser = await syncUserFromSession()

            return {
                ...data,
                user: authenticatedUser ?? data?.user ?? null
            }
        } catch (err) {
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            const authenticatedUser = await syncUserFromSession()

            return {
                ...data,
                user: authenticatedUser ?? data?.user ?? null
            }
        } catch (err) {
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return true
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
