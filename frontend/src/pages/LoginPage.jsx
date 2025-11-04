import './LoginPage.css';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'  //Importa useNavigate
import { client } from '../Supabase/client.js'


function Login() {
    // Pre-fill with demo credentials for interviewers
    const [email, setemail] = useState("demo@streetcred.app")
    const [password, setpassword] = useState("Demo123!")
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

            // Navigate to profile
            console.log("Navigating to /profile")

            navigate('/profile')
        } catch (error) {
            console.error("Error logging in:", error)
            alert("Login failed: " + error.message)
        }
    }

    // Quick demo login for interviewers - auto-submit
    const handleDemoLogin = async () => {
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: "demo@streetcred.app",
                password: "Demo123!"
            })
            if (error) throw error
            console.log("Demo login successful:", data)
            navigate('/profile')
        } catch (error) {
            console.error("Error with demo login:", error)
            alert("Demo login failed: " + error.message)
        }
    }

    return (
        <>
        
        <div className="login-page">   {/* background container */}
        <div className="main-site">  {/* the actual card */}
            <h2>Welcome Back!</h2>

            {/* Quick Demo Login Button */}
            <button
                type="button"
                onClick={handleDemoLogin}
                style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                🚀 Demo Login (No Sign up)
            </button>

            <div style={{
                textAlign: 'center',
                margin: '10px 0',
                color: '#666',
                fontSize: '14px'
            }}>
                — or use pre-filled credentials below —
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={e => setemail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setpassword(e.target.value)}
            />
            <button type="submit">Log In</button>
            </form>

            <div className="signup-redirect">
            <span>Don't have an account? </span>
            <Link to="/signup" className="signup-link">Sign up</Link>
            </div>
        </div>
        </div>

        </>
        
    )
}

export default Login
