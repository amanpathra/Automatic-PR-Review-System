import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/userContext';
import { FaCircleDot } from "react-icons/fa6";

const Logs = () => {

  const { accessToken, username, setUsername } = useContext(UserContext);
  const [events, setEvent] = useState([]);

  useEffect(() => {

    console.log("KINI bAr", username, "k", accessToken);

    if (!accessToken) return;

    const fetchUser = async () => {
      try{
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${accessToken}`
          }
        })
        const data = await response.json();
        console.log('fetchedUser, ', data.login);
        setUsername(data.login);
      }
      catch(error){
        console.log(error);
      }
    };

    // fetchUser();

    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:5000');

    // Open WebSocket connection and send the repository name
    fetchUser();
    // console.log('Kuch lickho')
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ username }));
    };

    // Listen for incoming messages
    ws.onmessage = (event) => {

      const data = JSON.parse(event.data);
      setEvent((prevData) => [...prevData, data]);
      // setProgressData(data); // Update state with received data
    };

    // Handle WebSocket close event
    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      if (event.wasClean) {
        console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error('Connection died unexpectedly');
      }
    };

    // Handle WebSocket error event
    ws.onerror = (error) => console.error('WebSocket error:', error);

    // Clean up WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, [accessToken, setUsername, username])

  return (
    <div className='Logs'>
      <h3>All your logs will be printed here:</h3>
      <div className="timeline">
        {events.map((event, index) => (
          <div key={index} className="timeline-item" style={{display: 'flex', columnGap: '10px', margin: '16px 0'}}>
            <div className={`icon`} style={{display: 'flex', alignItems: 'center'}}>
              <FaCircleDot />
            </div>
            <div className="logContent">
              <div className="time" style={{fontSize: 'small'}}>{event.time}</div>
              <div className="details">
                <p style={{margin: '0'}}>{event.message}</p>
                {/* {event.subDetails && <p className="sub-details">{event.subDetails}</p>} */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Logs