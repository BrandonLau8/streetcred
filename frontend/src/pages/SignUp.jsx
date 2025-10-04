import './SignUp.css';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { client } from '../Supabase/client.js'

function Signup() {
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await client.auth.signUp({
                email,
                password
            })
            if (error) throw error
            console.log("Sign up successful:", data)
            navigate('/profile')
        } catch (error) {
            console.error("Error signing up:", error)
        }
    }

    return (
        <div className="signup-page">
            <header className="header">
                <div className="logo">
                    <span className="logo-icon">📍</span>
                    <span className="logo-text">StreetCred</span>
                </div>
            </header>

            <main className="main-content">
                <h1 className="page-title">Create Account</h1>
                
                <form className="signup-form" onSubmit={handleSubmit}>
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
                            placeholder="Create a password" 
                            required
                            value={password}
                            onChange={e => setpassword(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" className="signup-button">Create Account</button>
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

                <div className="login-link">
                    <span>Already have an account? </span>
                    <Link to="/login">Log in</Link>
                </div>

                <div className="badge-promotion">
                    <span className="badge-icon">⭐</span>
                    <span>Unlock your first badge after 1 report!</span>
                </div>
            </main>
        </div>
    )
}

export default Signup
