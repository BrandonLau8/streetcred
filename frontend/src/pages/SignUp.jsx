import './SignUp.css';
// Hook de React para guardar y actualizar valores (en este caso, el email del usuario)
import { useState } from 'react'
import { client } from '../Supabase/client.js'

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
        <div className="main-site">
            <h2>WELCOME</h2>
            {/* En el evento del formulario, osea cuando le doy a submit voy a llamar a mi funcion llamada handleSubmit */}
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="youremail@site.com" 
                    required
                    //lo que se tipee como input setemail lo va a guardar en nuestra variable 'email' de arriba 
                    onChange={e => setemail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Enter password" 
                    required
                    //lo que se tipee como input setpassword lo va a guardar en nuestra variable 'password' de arriba 
                    onChange={e => setpassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
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
        </>
    )
}

export default Signup
