import './SignUp.css';
// Hook de React para guardar y actualizar valores (en este caso, el email del usuario)
import { useState } from 'react'
import { client } from '../Supabase/client.js'
import { Link } from 'react-router-dom';

function Signup() {
    //Para guardar en una variable en react lo que reciba del usuario necesito un state, al inicio es un empty string
    //email es la variable donde se guarda el valor, setemail es la que lo actualiza(email es la caja y setemail es la accion de poner algo en la caja)
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [showPopup, setShowPopup] = useState(false)

    const handleSubmit = async (e) => {
        //por defecto en los formularios cuando se les da submit estos refrescan la pagina
        //este evento de aqui lo que va a hacer es evitar que se refresque la pagina 
        e.preventDefault()
        //esta es una funcion asincrona, por que se envia al backend y se va a ir procesando
        try {
            //Llama a Supabase para iniciar sesión o registrarse usando signUp() enviado al email.
            //data va a contener la parte de datos de la respuesta de Supabase (usuario, sesión, etc)
            //error va a contener el posible error si ocurrió, o null si todo está bien.
            const { data, error } = await client.auth.signUp({
                email,
                password
            })
            if (error) throw error

            // If signup was successful and we have a user, create a profile record
            if (data.user) {
                const { error: profileError } = await client
                    .from('profiles')
                    .insert({
                        user_id: data.user.id,
                        name: email, // Set username to email for now
                        points: 0,
                        created_at: new Date().toISOString()
                    })

                if (profileError) {
                    console.error("Error creating profile:", profileError)
                    // Don't throw here - user was created successfully, just profile creation failed
                } else {
                    console.log("Profile created successfully")
                }
            }

            console.log("Sign up successful:", data)
            setShowPopup(true)
            setemail("")
            setpassword("")
        } 
        //si se detecto un error del if statement, saltamos automaticamente al catch
        catch (error) {
            console.error("Error signing up:", error)
        }
    }

    return (
        <>
  <div className="signup-page">    {/* Background container */}
    <div className="main-site">    {/* Card container */}
      <h2>Nice To Meet You!</h2>

      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="youremail@site.com" 
          required
          onChange={e => setemail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Enter password" 
          required
          onChange={e => setpassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
        <div className="login-redirect">
  <span>Already have an account? </span>
  <Link to="/login" className="login-link">Log in</Link>
</div>

      </form>
      

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Check your email to confirm signup!</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  </div>
</>

    )
}

export default Signup
