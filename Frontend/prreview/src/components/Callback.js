import React, { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { DNA as Loader } from 'react-loader-spinner';
import { UserContext } from '../context/userContext';

const Callback = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { setAccessToken } = useContext(UserContext);

    useEffect(() => {

        const connectGithub = async () => {
            const code = (new URLSearchParams(location.search)).get('code');

            try {
                const response = await fetch('http://localhost:5000/exchange-code', {
                    method: 'POST',
                    headers: {
                        // 'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: code }),
                });

                if (!response.ok) {
                    throw new Error(`Response is not okay`);
                }

                const data = await response.json();

                if (data.access_token) {
                    console.log('Access Token:', data.access_token);
                    setAccessToken(data.access_token);
                    navigate('/logs');
                } else {
                    console.error('Errorf:', data.error);
                }
            } catch (error) {
                console.error('Error exchanging code:', error);
            }
        }

        connectGithub();

    }, [location, navigate, setAccessToken])

  return (
    <div className='Callback'>
        <Loader
              height="80"
              width="80"
              ariaLabel="loading"
              wrapperClass
        />
    </div>
  )
}

export default Callback