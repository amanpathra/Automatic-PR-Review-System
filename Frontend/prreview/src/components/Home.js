import React, { useEffect } from 'react';
import { FaGithub } from "react-icons/fa";
import { useLocation } from 'react-router-dom';

const visitGithubLoginPage = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liocT77GnL0psN8P&scope=repo`;
}

const Home = () => {
    return (
        <div className='Home'>
            <h2 className="heading">Github Automatic PR Review System</h2>
            <div className="auth">
                <button className="connect" onClick={visitGithubLoginPage}>
                    <FaGithub/>
                    Connect to Github
                </button>
            </div>
        </div>
    )
}

export default Home;