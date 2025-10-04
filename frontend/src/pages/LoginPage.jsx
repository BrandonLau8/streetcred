import './LoginPage.css';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'  //Importa useNavigate
import { client } from '../Supabase/client.js'


function Login() {
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const navigate = useNavigate()  //Crea la función para navegar

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            console.log("Login successful:", data)

            // Si todo salió bien, navega a la ruta /home2
            navigate('/profile')
        } catch (error) {
            console.error("Error logging in:", error)
        }
    }

    return (
        <>
        
        <div className="main-site">
            <h2>NICE TO SEE YOU AGAIN!</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    onChange={e => setemail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    onChange={e => setpassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
        </div>
        </>
        
    )
}

export default Login
