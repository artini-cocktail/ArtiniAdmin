import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { Navigate } from "react-router-dom";


// ----------------------------------------------------------------------

export default function PrivateRoute({ children, mustBeLoggedIn = true }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoading(false);
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    return (<>Loading</>)
  }

  if (!isLoggedIn && mustBeLoggedIn) {
    return <Navigate to="/login" />
  }
  if (isLoggedIn && !mustBeLoggedIn) {
    return <Navigate to="/" />
  }

  return <>{children}</>;
}

PrivateRoute.propTypes = {
  children: PropTypes.node,
  mustBeLoggedIn: PropTypes.bool,
};
