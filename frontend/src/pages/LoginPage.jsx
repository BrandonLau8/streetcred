import './LoginPage.css';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { client } from '../Supabase/client.js'

function Login() {
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            console.log("Login successful:", data)
            navigate('/profile')
        } catch (error) {
            console.error("Error logging in:", error)
        }
    }

    return (
        <div className="login-page">
            <header className="header">
                <div className="logo">
                    <span className="logo-icon">📍</span>
                    <span className="logo-text">StreetCred</span>
                </div>
            </header>

            <main className="main-content">
                <h1 className="page-title">Log in to StreetCred</h1>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            required
                            value={email}
                            onChange={e => setemail(e.target.value)}
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            required
                            value={password}
                            onChange={e => setpassword(e.target.value)}
                        />
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>
                    
                    <button type="submit" className="login-button">Log in</button>
                </form>

                <div className="divider">
                    <span>or</span>
                </div>

                <div className="social-login">
                    <button className="social-button google">
                        <span className="google-icon">G</span>
                        Continue with Google
                    </button>
                    <button className="social-button github">
                        <span className="github-icon">🐙</span>
                        Continue with GitHub
                    </button>
                </div>

                <div className="badge-promotion">
                    <span className="badge-icon">⭐</span>
                    <span>Unlock your first badge after 1 report!</span>
                </div>
            </main>
        </div>
    )
}

export default Login
