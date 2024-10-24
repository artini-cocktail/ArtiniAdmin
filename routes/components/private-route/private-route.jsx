import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

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
    return <>Loading</>;
  }

  console.log('isLoggedIn', isLoggedIn);
  console.log('mustBeLoggedIn', mustBeLoggedIn);

  if (!isLoggedIn && mustBeLoggedIn) {
    console.log('Navigate to login');
    return <Navigate to="/login" />;
  }
  if (isLoggedIn && !mustBeLoggedIn) {
    console.log('Navigate to Home');
    return <Navigate to="/" />;
  }
  console.log('Render children');
  console.log(children);
  return <>{children}</>;
}

PrivateRoute.propTypes = {
  children: PropTypes.node,
  mustBeLoggedIn: PropTypes.bool,
};
